import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '../repository/Tournament.repository';
import { TournamentsBody } from '../models/Tournaments';
import { User } from '../models/User';
import { Game } from '../models/Game';
import RoundRepository from '../repository/Round.repository';
import { GameHistory, Players } from '../models/GameHistory';
import GameRepository from '../repository/Game.repository';

export class TournamentsController {
  private tournamentsRepository = new TournamentsRepository();
  constructor() {
    this.tournamentsRepository = new TournamentsRepository()
    //helpers
    this.isOpen = this.isOpen.bind(this);
    this.generateMatches = this.generateMatches.bind(this);    
   // this.generateRound = this.generateRound.bind(this);
    //basic crud
  //  this.createTournament = this.createTournament.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournament = this.updateTournament.bind(this);
    this.deleteTournament = this.deleteTournament.bind(this);
    //tournament actions
  //  this.addPlayerToTournament = this.addPlayerToTournament.bind(this);
  //  this.closeRegistrationsAndGenerateFirstRound = this.closeRegistrationsAndGenerateFirstRound.bind(this);
    this.generateNextRound = this.generateNextRound.bind(this);

    this.createTournamentForLoby = this.createTournamentForLoby.bind(this);
  }

  /**
   * check if the tournament is open for registration
   * @param tounamentId 
   * @returns 
   */
  async isOpen(tounamentId:number) {
    const tournament = await this.tournamentsRepository.getById(tounamentId);
    //tournament exist?
    if (!tournament) {
        return {isOpen:false, error: 'Tournament not found' };
    }
    //tournament is open for registration? created_at + 5min > now
    const dateCreatedAt = new Date(tournament.created_at);
    const dateNow = new Date();
    if (dateCreatedAt.getTime() + 5 * 60 * 1000 < dateNow.getTime()) {      
        return { isOpen: false, message: `Registration is closed, timeOut dateCreatedAt ${dateCreatedAt} dateNow ${dateNow}` };
    }

    if (tournament.state !== 'en attente') {
        return { isOpen: false, message: 'Registration is closed' };    }

    return { isOpen: true }; //tournament.state === 'registration';
  }
  //1- ON CREE UN TOURNOI

  //2 - ON AJOUTE UN JOUEUR AU TOURNOI
  //add player to tournament
/*   async addPlayerToTournament(request: FastifyRequest<{ Params: { id: string }, Body: {playerId:number} }>, reply: FastifyReply) {
    //@TODO definir une limite au nombre de joueurs
    const tounamentId = Number(request.params.id);
    const { playerId } = request.body;
    console.log("🔐TournamentsController addPlayerToTournament()  --tounamentId--",tounamentId
    , " --playerId--",playerId);
    //isOpen 
    const isOpen = await this.isOpen(tounamentId);
    if (!isOpen.isOpen) {
      return reply.status(400).send({ error:isOpen.message });
    }
    const tournament = await this.tournamentsRepository.addPlayer(tounamentId, Number(playerId));
    if (!tournament) { 
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(tournament);
  } */

  //** - utils: ON GENERE LES MATCHS
  //generate matches
  generateMatches(players: Players[]): Partial<Game>[] {
    const games/* : Partial<Game>[] */ = [];
    for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
            games.push({
              players:[(players[i].user)as number??undefined, (players[i+1].user)as number??undefined],
            gameHistory: { 
                          type: "type",//@TODO
                          players:[
                            {is_IA: false,
                             type: "type",//@TODO
                            avatar: players[i].avatar,
                            display_name: players[i].display_name,
                            score: 0,
                            user:  players[i].id},
                            {is_IA: false,
                            type: "type",//@TODO
                            avatar: players[i + 1].avatar,
                            display_name: players[i + 1].display_name,
                            score: 0,
                            user:  players[i + 1].id}
                          ] 
                        }});
        } else {
            games.push({players:[players[i]]/* , { id: 0, name: 'IA' } */,
              gameHistory: { 
                            type: "type",//@TODO
                            players:[
                              {is_IA: false,
                              type: "type",//@TODO
                              avatar: players[i].avatar,
                              display_name: players[i].display_name,
                              score: 0,
                              user:  players[i].id},
                              {is_IA: false,
                              type: "type",//@TODO
                              avatar: 'IA-avatar.png',
                              display_name: `IA-i+1`,
                              score: 0,
                              user:  null}
                            ] 
                          }});//@TODO IA
          // games.push([players[i],  new User({ id: 0, name: 'IA' })]);
        }
    }
    return games as Partial<Game>[];
  }
  //** - utils: ON GENERE LE ROUND avec les matchs
/*   async generateRound(players: Players[], tournamentId: number, currentRoundIndex: number = 0) {
    const matches = this.generateMatches(players) as Game[];
    const gameRepository = new GameRepository();
    const games =  matches.map(async (game: Game) => {
       const result = await gameRepository.create(game);
       return result;
      });
      await Promise.all(games);
   // const rounds = await roundRepository.create({players:playersIds, games:matches, state:'in_progress', current:currentRoundIndex});
    //update the tournament 
    const updatedTournament = await this.tournamentsRepository.update({id:tournamentId,state:'in_progress',currentRound:currentRoundIndex, games:games});
    return updatedTournament;
  } */

  //3 - ON FERME LES INSCRIPTIONS ET ON GENERE LE PREMIER ROUND
  //close registrations and generate first round
/*   async closeRegistrationsAndGenerateFirstRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tournamentId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(tournamentId);
    if (!tournament) {
        return reply.status(404).send({ error: 'Tournament not found' });
    }
    const {players} = tournament;
    if (!players) {
        return reply.status(400).send({ error: 'No players in the tournament' });
    }
    if (players.length < 2) {
        return reply.status(400).send({ error: 'Not enough players to generate a tournament' });
    }
    if (tournament.state === 'in_progress') {
        return reply.status(400).send({ error: 'Tournament is not in registration' });
    }

  //     const matches = this.generateMatches(players) as Game[];
  //  const playersIds = players.map((player: User) => player.id);
  //  const roundRepository = new RoundRepository();
  //  const rounds = await roundRepository.create({players:playersIds, games:matches,state:'in_progress',current:0});
  //  //update the tournament 
  //  const updatedTournament = await this.tournamentsRepository.addRound(tournamentId,Number(rounds.id),0); 
    const updatedTournament = await this.generateRound(players as User[], tournamentId);
    return reply.send(updatedTournament);
  } */

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
        score: 0,
        user: player.user,
      } as DTOPlayer));
      const dtoPairedPlayers = splitIntoPairs(dtoplayers);
    const games = await Promise.all(
      (dtoPairedPlayers??[]).map(async (players: DTOPlayer[]): Promise<Game> => {
        const db = {
          state: tournament.state,
          type: tournament.type,
          format: "tournament.format",
          max_players:2,
          players: players.map((player: DTOPlayer) => player.user).filter((userId) => userId !== null),
          gameHistory: {
            players: players,
            type: tournament.type === "local" ? "local" : "remote",
          },
          currentRound: currentRoundIndex + 1,
          tournament: tournament.id,
        };
    
        const game = await gameRepository.create({
          ...db,
          type: tournament.type === "local" ? "local" : "remote",
          format: "normal",
          mode: "normal",
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





/* 
    if ((!rounds || rounds.length === 0) && currentRoundIndex === 0) {
      const players:Players[] = (tournament.players ?? [])
      .map((user: User) => (
        {
          is_IA: false,
          type: "type",//@TODO
          avatar: user.avatar?? 'IA-avatar.png',
          display_name: user.name?? `IA-${user.id}`,
          score: 0,
          user:  user.id?? null
        }))
      //this.generateMatches(players);
      //creer le round 0
      this.generateRound(players, tournamentId, currentRoundIndex);
      //generate firstround with tournament.players
      //return {games:Games[],currentRoundIndex:number,TournamentId:number,winner:string|null}
        return reply.status(400).send({ error: 'No games in the tournament' });
    }
    if (!rounds || rounds.length === 0) {
        return reply.status(400).send({ error: 'No games in the current round' });
    }

    //verifier si le round est terminé , c'est a dire s'il y a un winner dans gameHistory
    // 1- recuperer les games du round terminee
    const currentRound = rounds.filter(game =>game.gameHistory?.winner != null);
    const isRoundFinished = currentRound?.map(game =>game.gameHistory?.winner != null).reduce((acc, curr) => acc && curr, true);
    //pas de winner dans le round : la game n'est pas finie
    if (!isRoundFinished) {
        return reply.status(400).send({ error: 'Current round is not finished' });
    }
    //2- recuperer les winners
    //2 - les winners sont les joueurs qui ont gagné dans le round
    // c'est a dire dans les gameHistory.players[], celui qui a le plus de score
    const winners = currentRound?.map(game => this.winnerIs(game.gameHistory?.players))
                                 .filter((winner: Players | null) => winner !== null);//filter pour retirer les null
    console.log("🔐TournamentsController winners",winners);

    if (winners && winners.length < 2) {
      const updatedTournament = await this.tournamentsRepository.update({id:tournamentId,state:'finished',winner:winners[0]?.display_name!});
      return reply.status(200).send({ winner: winners[0] });
    }
//     const matches = this.generateMatches(winners as User[]) as Game[]; 
//    const playersIds = (winners as User[]).map((player: User) => player.id);
//    const roundRepository = new RoundRepository();
//    const rounds = await roundRepository.create({players:playersIds, games:matches,state:'in_progress',current:currentRoundIndex+1});
    //update the tournament 
//    const updatedTournament = await this.tournamentsRepository.addRound(tournamentId,rounds.id,currentRoundIndex + 1); 
    const updatedTournament = await this.generateRound(winners , tournamentId, currentRoundIndex + 1);
    return reply.send(updatedTournament); */
  }

/*     async createTournament(request: FastifyRequest<{ Body: TournamentsBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      const tournament = await this.tournamentsRepository.create(requestBody);
      if (!tournament) {
        return reply.status(404).send({ error: 'Tournament creation failed' });
      }
      return reply.status(201).send(tournament);
    } */

  async getTournaments(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--TournamentsController getTournaments ");
    const tournaments = await  this.tournamentsRepository.getAll();
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
   const {type:paramType, format: paramFormat} = request.params;
   console.log("TournamentsController createTournamentForLoby()  --paramType--",paramType, " --paramFormat--",paramFormat);
   console.log("TournamentsController createTournamentForLoby()  --requestBody--",requestBody);
   const {players, configPlayers,state,type,format,max_players} = requestBody;
   if (!players) {
    console.log("TournamentsController createTournamentForLoby()  --!players--",players);
    return reply.status(400).send({ error: 'No players in the tournament' });
  }
  if (players.length < 2 && paramType !== 'local') {
    console.log("TournamentsController createTournamentForLoby()  --players.length < 2 && paramType !== 'local'--",players.length < 2 && paramType !== 'local');
    return reply.status(400).send({ error: 'Not enough players to generate a tournament' });
  }
  console.log("TournamentsController createTournamentForLoby()  --{players:players, state:created,max_players, type, currentRound:0}--",{players:players, state:"created",max_players, type, currentRound:0});
  const tournament = await this.tournamentsRepository.create({players:players, state:"created",max_players, type, currentRound:0});
  if (!tournament) {
    console.log("TournamentsController createTournamentForLoby()  --!tournament--",tournament);
    return reply.status(404).send({ error: 'Tournament creation failed' });
  }

  //le tournois est cree, la liaison avec les players effectue. mais pas encore de games


    const gameRepository = new GameRepository();
    if (type === 'local') {
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
              type: paramType === "local" ? "local" : "remote",
            },
            currentRound: 0,
            tournament: tournament.id,
          };
      
          const game = await gameRepository.create({
            ...db,
            type: paramType === "local" ? "local" : "remote",
            format: "normal",
            mode: "normal",
          });
      
          console.log("TournamentsController createTournamentForLoby()  --game--", game);
          return game;
        })
      );
      console.log("TournamentsController createTournamentForLoby()  --ALL Games--", games);

      return reply.status(201).send({
        tournament: tournament,
        games: games});

      //on va creer le gameHistory avec les players
      //on va creer le game avec le gameHistory et les players
   /*  const db ={
      state,
      type:paramType,
      format:paramFormat,
      max_players,
      players: players,
      gameHistory : {
        players: configPlayers.players,
        type:paramType=="local"?"local":"remote",
      },
      currentRound:0,
      tournament: tournament.id,*/
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