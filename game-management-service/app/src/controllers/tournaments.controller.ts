import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '@src/repository/Tournament.repository';
import { TournamentsBody } from '@src/models/Tournaments';
import { User } from '@src/models/User';
import { Game } from '@src/models/Game';
import RoundRepository from '@src/repository/Round.repository';

export class TournamentsController {
  private tournamentsRepository = new TournamentsRepository();
  constructor() {
    this.tournamentsRepository = new TournamentsRepository()
    //helpers
    this.isOpen = this.isOpen.bind(this);
    this.generateMatches = this.generateMatches.bind(this);    
    this.generateRound = this.generateRound.bind(this);
    //basic crud
    this.createTournament = this.createTournament.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournament = this.updateTournament.bind(this);
    this.deleteTournament = this.deleteTournament.bind(this);
    //tournament actions
    this.addPlayerToTournament = this.addPlayerToTournament.bind(this);
    this.closeRegistrationsAndGenerateFirstRound = this.closeRegistrationsAndGenerateFirstRound.bind(this);
    this.generateNextRound = this.generateNextRound.bind(this);

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
  async addPlayerToTournament(request: FastifyRequest<{ Params: { id: string }, Body: {playerId:number} }>, reply: FastifyReply) {
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
  }

  //** - utils: ON GENERE LES MATCHS
  //generate matches
  generateMatches(players: User[]): {players: Partial<User>[]}[] {
    const matches = [];
    for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
            matches.push({players:[{id:players[i].id}, {id:players[i + 1].id}]});
        } else {
            matches.push({players:[{id:players[i].id}, { id: 0, name: 'IA' }]});//@TODO IA
          // matches.push([players[i],  new User({ id: 0, name: 'IA' })]);
        }
    }
    return matches;
  }
  //** - utils: ON GENERE LE ROUND avec les matchs
  async generateRound(players: User[], gameId: number, currentRoundIndex: number = 0) {
    const matches = this.generateMatches(players as User[]) as Game[]; 
    const playersIds = (players as User[]).map((player: User) => player.id);
    const roundRepository = new RoundRepository();
    const rounds = await roundRepository.create({players:playersIds, games:matches, state:'in_progress', current:currentRoundIndex});
    //update the tournament 
    const updatedTournament = await this.tournamentsRepository.addRound(gameId, rounds.id, currentRoundIndex);
    return updatedTournament;
  }

  //3 - ON FERME LES INSCRIPTIONS ET ON GENERE LE PREMIER ROUND
  //close registrations and generate first round
  async closeRegistrationsAndGenerateFirstRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(gameId);
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

  /*     const matches = this.generateMatches(players) as Game[];
    const playersIds = players.map((player: User) => player.id);
    const roundRepository = new RoundRepository();
    const rounds = await roundRepository.create({players:playersIds, games:matches,state:'in_progress',current:0});
    //update the tournament 
    const updatedTournament = await this.tournamentsRepository.addRound(gameId,Number(rounds.id),0); */
    const updatedTournament = await this.generateRound(players as User[], gameId);
    return reply.send(updatedTournament);
  }

  //4 - ON GENERE LE ROUND SUIVANT
  //generate next round
  async generateNextRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(gameId);
    if (!tournament) {
        return reply.status(404).send({ error: 'Tournament not found' });
    }
    // Check if the tournament is in progress
    if (tournament.state !== 'in_progress') {
        return reply.status(400).send({ error: 'Tournament is not in progress' });
    }
    if (!tournament.rounds || tournament.currentRound === undefined) {
        return reply.status(400).send({ error: 'No rounds in the tournament' });
    }

    // Check if the current round exist and is finished
    const currentRoundIndex = tournament.currentRound!;

    const lastRound = tournament.rounds[currentRoundIndex];
    const isRoundFinished = lastRound.games.map(game =>game.gameHistory != null).reduce((acc, curr) => acc && curr, true);
    if (!isRoundFinished) {
        return reply.status(400).send({ error: 'Current round is not finished' });
    }
    const winners = lastRound.games.map(game => game.gameHistory!.score1 > game.gameHistory!.score2 ? game.players[0] : game.players[1]);
    console.log("🔐TournamentsController winners",winners);

    if (winners.length < 2) {
      const updatedTournament = await this.tournamentsRepository.update({id:gameId,state:'finished',winner:winners[0]});
      return reply.status(200).send({ winner: winners[0] });
    }
    /* const matches = this.generateMatches(winners as User[]) as Game[]; 
    const playersIds = (winners as User[]).map((player: User) => player.id);
    const roundRepository = new RoundRepository();
    const rounds = await roundRepository.create({players:playersIds, games:matches,state:'in_progress',current:currentRoundIndex+1});
    //update the tournament 
    const updatedTournament = await this.tournamentsRepository.addRound(gameId,rounds.id,currentRoundIndex + 1); */
    const updatedTournament = await this.generateRound(winners as User[], gameId, currentRoundIndex + 1);
    return reply.send(updatedTournament);
  }

    async createTournament(request: FastifyRequest<{ Body: TournamentsBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      const tournament = await this.tournamentsRepository.create(requestBody);
      if (!tournament) {
        return reply.status(404).send({ error: 'Tournament creation failed' });
      }
      return reply.status(201).send(tournament);
    }

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
}


