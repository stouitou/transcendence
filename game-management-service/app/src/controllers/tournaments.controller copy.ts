import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '../repository/Tournament.repository';
import { User, UserStats } from '../models/User';
import { Game } from '../models/Game';
import {  Players } from '../models/Players';
import GameRepository from '../repository/Game.repository';
import { IParams } from '@src/repository/helpers';
import UserRepository from '@src/repository/User.repository';

export class TournamentsController {
  private tournamentsRepository = new TournamentsRepository();
  constructor() {
    this.tournamentsRepository = new TournamentsRepository()
    //basic crud
    this.createTournamentForLoby = this.createTournamentForLoby.bind(this);
  //  this.createTournament = this.createTournament.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournament = this.updateTournament.bind(this);
    this.deleteTournament = this.deleteTournament.bind(this);
    //tournament actions 
    this.generateNextRound = this.generateNextRound.bind(this);

  }

  winnerIs(players:Players[] | undefined): Players | null {
    //3 - ON RECUPERE LE GAGNANT
    //get winner
    if (!players) {
      return null;
    }
    const winner = players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    return winner;
  }
  //4 - ON GENERE LE ROUND SUIVANT
  //generate next round
  async generateNextRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    console.log("[TournamentsController] generateNextRound()  --request--",request.params.id);
    const tournamentId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(tournamentId);
    if (!tournament) {
    console.log("[TournamentsController] generateNextRound()  --not found--",request.params.id);
        return reply.status(404).send({ error: 'Tournament not found' });
    }
    // Check if the tournament is in progress//@BUG //@TODO
/*     if (tournament.state !== 'in_progress' && tournament.state !== 'created') {
        return reply.status(400).send({ error: 'Tournament is not in progress' });
    } */
    if (tournament.winner) {
      console.log("[TournamentsController] generateNextRound()  --winner--",tournament.winner);
      console.log("[TournamentsController] generateNextRound()  --winner tournament data--",tournament);

      return reply.status(200).send({
        tournament: tournament,
        games: []});//@TODO a redefinir
  }
    // Check if the current round exist and is finished
    const currentRoundIndex = tournament.currentRound!;

   //construire des rounds avec les games par currentRound
   const rounds = tournament.games?.filter((game: Game) => game.currentRound === currentRoundIndex)
    .map((game: Game) => game);

    if (rounds) {
      //on extrait les gagnants via gameHistory
      console.log("[TournamentsController] generateNextRound()  --rounds--",rounds.length);

     const roundWinners = rounds.map((game: Game) => {
        const winner = this.winnerIs(game.gameHistory?.players);
        console.log("🔐TournamentsController generateNextRound()  --winner--",winner);
          return winner;
      }).filter((winner: Players | null) => winner !== null);//filter pour retirer les null

      console.log("[TournamentsController] generateNextRound()  --roundWinners--",roundWinners);

    if (roundWinners && roundWinners.length < 2) {
      console.log("[TournamentsController] generateNextRound()  --updatedTournament--");

      const updatedTournament = await this.tournamentsRepository.update({id:tournamentId,state:'finished',winner:roundWinners[0]?.id!});

      //update lose / win user stats
      const {type,players} = tournament as {type:'local'|'remote',players:User[]};
       const games = await Promise.all(players.map(async (user: User) => {
      //  console.log(" GameRepository.updateGameHistory()  --STATS-- user--",player);
       // const { user } = player;
        if (!user || user === null || typeof user === 'undefined' || typeof user === 'number') {
        //  console.warn(" GameRepository.updateGameHistory()  --STATS-- player is null or undefined",player);
          return null; // Skip if user is not defined
        }
       // console.log(" GameRepository.updateGameHistory()  --STATS-- user--",user);
        const fieldName = roundWinners[0]? user.name == roundWinners[0].display_name ? `won`: `lost` : `draw`;

        const userStatsData = buildUserStatsResult(user, 'tournament', type, fieldName);

        const userUpdated = await (new UserRepository()).update(userStatsData);
        return userUpdated;
       }));
     //  console.log(" GameRepository.create()  --gameCreated-STATS- UPDATED--",games)
    
/*     return reply.send(gameHistory);
  } */
      console.log("[TournamentsController] generateNextRound()  --updatedTournament data--",updatedTournament);
      return reply.status(200).send({
        tournament: updatedTournament,
        games: []});
    }
    //on va generer le round suivant avec les gagnants
    //

      const gameRepository = new GameRepository();

      const dtoplayers:DTOPlayer[] = roundWinners.map((player: Players) => ({
        type: player.type,
        is_IA: player.is_IA,
        avatar: player.avatar,
        display_name: player.display_name,
        score: player.score,
        user: player.user,
      } as DTOPlayer));
      const dtoPairedPlayers = splitIntoPairs(dtoplayers);
    const games = await Promise.all(
      (dtoPairedPlayers??[]).map(async (players: DTOPlayer[]): Promise<Game> => {
        const db = {
          state: tournament.state,
          type: tournament.type,
          format: "tournament",
          max_players:2,
          players: players.map((player: DTOPlayer) => player.user).filter((userId) => userId !== null),
          gameHistory: {
            players: players,
            type: tournament.type /* === "local" ? "local" : "remote" */,
            format: "tournament" as "tournament",
          },
          currentRound: currentRoundIndex + 1,
          tournament: tournament.id,
        };
    
        const game = await gameRepository.create({
          ...db,
          type: tournament.type === "local" ? "local" : "remote",
          format: 'tournament',//normal',
        });
    
        console.log("TournamentsController createTournamentForLoby()  --game--", game);
        return game;
      })
    );
    console.log("TournamentsController createTournamentForLoby()  --ALL Games--", games);

    //on update currentRound dans le tournoi
    const updatedTournament = await this.tournamentsRepository.update({id:tournamentId,state:'in_progress',currentRound:currentRoundIndex + 1});

    return reply.status(201).send({
      tournament: updatedTournament,
      games: games});
    }
  }

//5 - ON RECUPERE LES TOURNOIS
  async getTournaments(request: FastifyRequest, reply: FastifyReply) {   
        console.log("--TournamentsController getTournaments ");
        const query = request.query as IParams;
       // const options = new BuildOptions(query).getOptions();
        const tournaments = await  this.tournamentsRepository.getAllbyQuery(query);
        console.log("TournamentsController getTournaments ",tournaments);
          return reply.send(tournaments);
  }


  async getTournamentById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tournamentId = Number(request.params.id);
    const tournaments = await this.tournamentsRepository.getById(tournamentId);
        if (!tournaments) {
      return reply.status(404).send({ error: 'tournaments not found' });
    }
    return reply.send(tournaments);
  }

  async updateTournament(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
    const tournamentId = Number(request.params.id);
    if (!tournamentId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { state } = requestBody;
    const updatedTournament = await this.tournamentsRepository.update({id:tournamentId, state});//@TODO providers??
    console.log("TournamentsController updateTournament ",updatedTournament);

    if (!updatedTournament) {
      return reply.status(404).send({ error: 'Tournament not found' });
    }
    return reply.send(updatedTournament);
  }
  
  async deleteTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tounamentId = parseInt(request.params.id);
    const tournament = await this.tournamentsRepository.delete(tounamentId);
    return reply.send(tournament);
  }


//Body TournamentsBody
  async createTournamentForLoby(request: FastifyRequest<{ Body: ReceivedData, Params: { type: string,format:string } }>, reply: FastifyReply) {  
    const { ...requestBody } = request.body;
   //on recupere un tournois avec les players mais sans les games
   //de pus les players local ne sont pas setup
   //on va donc recupere le type local ou remote des queries
   const {type:paramType, format: paramFormat} = request.params as {type:"local"|"remote", format:"classic"|"tournament"};
   console.log("TournamentsController createTournamentForLoby()  --paramType--",paramType, " --paramFormat--",paramFormat);
   console.log("TournamentsController createTournamentForLoby()  --requestBody--",requestBody);
   const {players, configPlayers,state,type,format,max_players} = requestBody;
   if (!players) {
    console.log("TournamentsController createTournamentForLoby()  --!players--",players);
    return reply.status(400).send({ error: 'No players in the tournament' });
  }
  if (players.length < 2 && paramType !== 'local') {
    console.log("TournamentsController createTournamentForLoby()  --players.length < 2 && paramType !== 'local'--",players.length < 2);
    return reply.status(400).send({ error: 'Not enough players to generate a tournament' });
  }
  console.log("TournamentsController createTournamentForLoby()  --{players:players, state:created,max_players, type, currentRound:0}--",{players:players, state:"created",max_players, type, currentRound:0});
  const tournament = await this.tournamentsRepository.create({players:players, state:"created",max_players, type, currentRound:0});
  if (!tournament) {
    console.log("TournamentsController createTournamentForLoby()  --!tournament--",tournament);
    return reply.status(404).send({ error: 'Tournament creation failed' });
  }
    console.log("TournamentsController createTournamentForLoby()  --tournament--",tournament);

  //le tournois est cree, la liaison avec les players effectue. mais pas encore de games


    const gameRepository = new GameRepository();
    if (1) {
      //on va recuperer les players avec leur id
      //et on va les ajouter dans le tournoi
      const players = configPlayers.players.map((player:DTOPlayer) => ({
        type: player.type,
        is_IA: player.is_IA,
        avatar: player.avatar,
        display_name: player.display_name,
        score: 0,
        user: player.user,
      }));
      //on melange les players
      players.sort(() => Math.random() - 0.5);
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
      const playersWithIA = mergePlayersWithIA(players, playersIa);

      //on va creer les games avec les players
       const games = await Promise.all(
        playersWithIA.map(async (players: DTOPlayer[]): Promise<Game> => {
          const db = {
            state,
            type: paramType,
            format: paramFormat,
            max_players,
            players: players.map((player: DTOPlayer) => player.user).filter((userId) => userId !== null),
            gameHistory: {
              players: players,
              type: (paramType === "local" ? "local" : "remote") as "local" | "remote",
              format: paramFormat,
            },
            currentRound: 0,
            tournament: tournament.id,
          };
      
          const game = await gameRepository.create({
            ...db,
            type: paramType === "local" ? "local" : "remote",
            format: paramFormat//"classic"|"tournament",
           // mode: "normal",
          });
      
          console.log("TournamentsController createTournamentForLoby()  --game--", game);
          return game;
        })
      );
      console.log("TournamentsController createTournamentForLoby()  --ALL Games--", games);

      return reply.status(201).send({
        tournament: tournament,
        games: games});
    }
  }

  async generateNextRoundTournamentForLoby(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const tournamentId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(tournamentId);
    if (!tournament) {
        return reply.status(404).send({ error: 'Tournament not found' });
    }
    // Check if the tournament is in progress
    if (tournament.state !== 'in_progress') {
        return reply.status(400).send({ error: 'Tournament is not in progress' });
    }
    if (tournament.winner) {
      return reply.status(400).send({ error: 'Tournament is finished', winner:tournament.winner });//@TODO a redefinir
  }

}

}



type ReceivedData = {
    state:string,
    type:'remote' | 'local';
    format:"tournament" | "classic";
    max_players:number;
    players: number[] | null;
    configPlayers: {
      players: DTOPlayer[];
    }
}

interface DTOPlayer {
  type: 'remote' | 'local';
  is_IA: boolean;
  avatar: string;
  display_name: string;
  score: number;
  user: number | null;
}

class DTOPlayer{
  constructor(data:DTOPlayer) {
    const {type,is_IA,avatar,display_name,score,user} = data;
    this.type = type;
    this.is_IA = is_IA;
    this.avatar = avatar;
    this.display_name = display_name;
    this.score = score;
    this.user = user;
  }
}



   function mergePlayersWithIA(players: DTOPlayer[], playersIa: DTOPlayer[]): DTOPlayer[][] {
    const merged: DTOPlayer[] = [];
    const maxLength = Math.max(players.length, playersIa.length);
  
    for (let i = 0; i < maxLength; i++) {
      if (i < players.length) {
        merged.push(players[i]); // Ajouter un joueur
      }
      if (i < playersIa.length) {
        merged.push(playersIa[i]); // Ajouter une IA
      }
    }
  
    return splitIntoPairs(merged);
  }

  function splitIntoPairs(players: DTOPlayer[]): DTOPlayer[][] {
    const pairs: DTOPlayer[][] = [];
    for (let i = 0; i < players.length; i += 2) {
      pairs.push(players.slice(i, i + 2)); // Prend 2 éléments à chaque itération
    }
    return pairs;
  }

//for tournament only
  export const buildUserStatsResult = (user: User, format:"classic"|"tournament",type:'local'|'remote', fieldName: `won`| `lost` | `draw`) => {
    const userStats:UserStats = { 
      ...user.userStats,
      [`${format}_${type}_game_${fieldName}`]: user.userStats[`${format}_${type}_game_${fieldName}`] + 1,
      // [`<classic|tournament>_<local|remote>_game_<won|lost|draw>`]: user.userStats[`<classic|tournament>_<local|remote>_game_<won|lost|draw>`] + 1,
  
    };
    //si le format est "classic" , on incrémente le total_game_<won|lost|draw>
     if (format === "tournament") {
      userStats[`${format}_total_game_${fieldName}`] = user.userStats[`${format}_total_game_${fieldName}`] + 1;
    }
    //update level for user local
    if (fieldName === "won") {
      if (type==='local' && format === "classic") {
        user.level = user.level?user.level + 1:1; //increment level for classic local won
      }
      if (type==='remote' && format === "classic") {
        user.level = user.level?user.level + 2:2; //increment level for classic remote won
      }
      if (type==='local' && format === "tournament") {
        user.level = user.level?user.level + 1:1; //increment level for tournament local won
      }
      if (type==='remote' && format === "tournament") {
        user.level = user.level?user.level + 2:2; //increment level for tournament remote won
      }
    }
    return {id:user.id,userStats,level:user.level};
  }