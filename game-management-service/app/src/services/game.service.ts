import { DTOPlayer } from "../DTO/DTOPlayer";
import { Game } from "../models/Game";
import { Players } from "../models/Players";
import { Tournaments } from "../models/Tournaments";
import GameRepository from "../repository/Game.repository";
import { mergePlayersWithIA, splitIntoPairs } from "../utils/tournament.utils";

export class GameService {
	private gameRepo = new GameRepository();

	async createNextRoundGames(tournament: Tournaments, players: Players[], round: number): Promise<Game[]> {
		const dtoPlayers:DTOPlayer[] = players.map(p => ({
			type: p.type,
			is_IA: p.is_IA,
			avatar: p.avatar,
			display_name: p.display_name,
			score: p.score,
			user: p.user,
		} as DTOPlayer));

    const pairs = splitIntoPairs(dtoPlayers);

    return Promise.all(pairs.map(async (pair) => {
		const game = await this.gameRepo.create({
				state: tournament.state,
				type: tournament.type,
				format: 'tournament',
				max_players: 2,
				players: pair.map(p => p.user).filter((u): u is number => u !== null && u !== undefined),
				gameHistory: {
					players: pair,
					type: tournament.type,
					format: 'tournament',
				},
				currentRound: round,
				tournament: tournament.id,
			});

			return game;
		}));
  }


   async createFirstRoundGames(tournament: Tournaments, players: Players[], round: number): Promise<Game[]> {
	const max_players = tournament.max_players || 16; // Default to 8 if not specified
		const dtoPlayers:DTOPlayer[] = players.map(p => ({
			type: p.type,
			is_IA: p.is_IA,
			avatar: p.avatar,
			display_name: p.display_name,
			score: 0,
			user: p.user,
		} as DTOPlayer));

      //on melange les players
    dtoPlayers.sort(() => Math.random() - 0.5);
	 //mais pour cela on a peux etre besoin de rajouter des ia 
      const playersIa:DTOPlayer[] = []
      if (players.length < max_players) {
        const nbIa = max_players - players.length;
        for (let i = 0; i < nbIa; i++) {
			playersIa.push({
				type: 'local',
				is_IA: true,
				avatar: 'IA-avatar.png',
				display_name: `IA-${i}`,
				score: 0,
				user: null,
			});
		}
      }
	//dans players, on isere les Ia un players / 2
    const playersWithIAPairs = mergePlayersWithIA(dtoPlayers, playersIa);

    return Promise.all(playersWithIAPairs.map(async (pair) => {
      const game = await this.gameRepo.create({
        state: tournament.state,
        type: tournament.type,
        format: 'tournament',
        max_players: 2,
        players: pair.map(p => p.user).filter((u): u is number => u !== null && u !== undefined),
        gameHistory: {
          players: pair,
          type: tournament.type,
          format: 'tournament',
        },
        currentRound: round,
        tournament: tournament.id,
      });

      return game;
    }));
  }
}


//
      //on va creer la game avec des paires de players
      // ex : 4 players => 2 games => 2 players par game ==> 1 final
      //ex : 8 players => 4 games => 2 players par game ==> 1 final
      //ex : 16 players => 8 games => 2 players par game ==> 1 final
      //ex : 32 players => 16 games => 2 players par game ==> 1 final
     // dans les autre cas  on  ajoute des IA pour atteindre le nombre de joueurs
      //ex : 2 players c'est une game pas un tournois
      // 4 player 
      //ex : 3 players + 1 IA => 2 games => 2 players par game ==> 1 final
      // 8 player
      //ex : 5 players + 3 IA => 4 games => 2 players par game ==> 1 final
      //ex : 6 players + 2 IA => 4 games => 2 players par game ==> 1 final
      //ex : 7 players + 1 IA => 4 games => 2 players par game ==> 1 final
      //16 players

      //ex : 9 players + 7 IA => 8 games => 2 players par game ==> 1 final
      //ex : 10 players + 6 IA => 8 games => 2 players par game ==> 1 final
      //ex : 11 players + 5 IA => 8 games => 2 players par game ==> 1 final
      //ex : 12 players + 4 IA => 8 games => 2 players par game ==> 1 final
      //ex : 13 players + 3 IA => 8 games => 2 players par game ==> 1 final
      //ex : 14 players + 2 IA => 8 games => 2 players par game ==> 1 final
      //ex : 15 players + 1 IA => 8 games => 2 players par game ==> 1 final

      //mais pour cela on a peux etre besoin de rajouter des ia 