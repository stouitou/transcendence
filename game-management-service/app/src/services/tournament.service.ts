import { Game } from "../models/Game";
import { Players } from "../models/Players";
import TournamentsRepository from "../repository/Tournament.repository";
import { GameService } from "./game.service";
import { StatsService } from "./stats.service";
import { DTOPlayer } from "../DTO/DTOPlayer";
type ReceivedData = {
    state: string;
    type: "remote" | "local";
    format: "tournament" | "classic";
    max_players: number;
    players: number[] | null;
    configPlayers: {
        players: DTOPlayer[];
    };
}



export class TournamentService {
	constructor(
		private tournamentRepo = new TournamentsRepository(),
		private gameService = new GameService(),
		private statsService = new StatsService()
	) {}


  /**
   * createTournament and create the first round of games
   * @param body 
   * @returns 
   */
	async createTournament(body: ReceivedData) {
		const {players, configPlayers,state,type,format,max_players} = body;
		if (!players /* || players.length < 2 && type !== 'local' */) {
			console.error('Players is required');
		throw { status: 400, message: 'body.players is required' };
		}
    let currentMaxPlayers = max_players || 16; // Default to 4 if not specified
    //adpater le max_players au nombre de players
    if (configPlayers.players.length <= 4 ) currentMaxPlayers = 4;
    else if (configPlayers.players.length <= 8) currentMaxPlayers = 8;
    else if (configPlayers.players.length <= 16) currentMaxPlayers = 16;
    else throw { status: 400, message: 'Too many players for a tournament' }; // Limit to powers of two
    // 4, 8, 16

		const tournament = await this.tournamentRepo.create({players:players, state:"created",max_players:currentMaxPlayers, type, currentRound:0});
		if (!tournament) throw { status: 400, message: 'Tournament creation failed' };

		const games = await this.gameService.createFirstRoundGames(tournament, configPlayers.players, 0);
		if (!games || games.length === 0) {
			console.error('[tournamentService] createTournament No games created for the first round');
			throw { status: 400, message: 'No games created for the first round' };
		}

		return {tournament, games};
	}

  async generateNextRound(tournamentId: number) {
    const tournament = await this.tournamentRepo.getById(tournamentId);	
    if (!tournament) throw { status: 404, message: 'Tournament not found' };
	if (!tournament.players) {
	  throw { status: 400, message: 'No players in this tournament' };
	}
    if (tournament.winner) return { tournament, games: [] };

    const currentRoundIndex = tournament.currentRound!;
    const currentGames = this.getGamesForCurrentRound(tournament, currentRoundIndex);
    const winners = this.extractWinnersFromGames(currentGames);

    if (winners.length < 2) {
      const updatedTournament = await this.tournamentRepo.update({
        id: tournamentId,
        state: 'finished',
        winner: winners[0]?.id,
      });

      await this.statsService.updateUserStats(tournament.players, winners[0], tournament.type);

      return { tournament: updatedTournament, games: [] };
    }

    const newGames = await this.gameService.createNextRoundGames(tournament, winners, currentRoundIndex + 1);
    const updatedTournament = await this.tournamentRepo.update({
      id: tournamentId,
      state: 'in_progress',
      currentRound: currentRoundIndex + 1,
    });

    return { tournament: updatedTournament, games: newGames };
  }

	private getGamesForCurrentRound(tournament: any, round: number): Game[] {
		return tournament.games?.filter((game: Game) => game.currentRound === round) || [];
	}

	private extractWinnersFromGames(games: Game[]): Players[] {
		return games.map(game => {
			return game.gameHistory?.players?.reduce((a, b) => (a.score > b.score ? a : b)) || null;
		}).filter(Boolean) as Players[];
	}
}
