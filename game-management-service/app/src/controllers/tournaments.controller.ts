import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '../repository/Tournament.repository';
import { IParams } from '@src/repository/helpers';
import { TournamentService } from '@src/services/tournament.service';
import { ReceivedData } from '@src/types/data.types';

export class TournamentsController {
  private tournamentsRepository = new TournamentsRepository();
  private tournamentService = new TournamentService();
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

  //generate next round
  async generateNextRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    console.log("[TournamentsController] generateNextRound()  --request--",request.params.id);
     const tournamentId = Number(request.params.id);
  try {
    const result = await this.tournamentService.generateNextRound(tournamentId);
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(err.status || 500).send({ error: err.message });
  }
}

  /**
   * Get all tournaments 
   * @param request 
   * @param reply 
   * @returns 
   */
  async getTournaments(request: FastifyRequest, reply: FastifyReply) {   
        console.log("--TournamentsController getTournaments ");
        const query = request.query as IParams;
       // const options = new BuildOptions(query).getOptions();
        const tournaments = await  this.tournamentsRepository.getAllbyQuery(query);
        console.log("TournamentsController getTournaments ",tournaments);
          return reply.send(tournaments);
  }

  /**
   * Get tournament by id
   * @param request 
   * @param reply 
   * @returns 
   */
  async getTournamentById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tournamentId = Number(request.params.id);
    const tournaments = await this.tournamentsRepository.getById(tournamentId);
        if (!tournaments) {
      return reply.status(404).send({ error: 'tournaments not found' });
    }
    return reply.send(tournaments);
  }

  /**
   * Update tournament by id
   * @param request 
   * @param reply 
   * @returns 
   */
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
    const updatedTournament = await this.tournamentsRepository.update({id:tournamentId, state});
    console.log("TournamentsController updateTournament ",updatedTournament);

    if (!updatedTournament) {
      return reply.status(404).send({ error: 'Tournament not found' });
    }
    return reply.send(updatedTournament);
  }
  
  /**
   * Delete tournament by id
   * @param request 
   * @param reply 
   * @returns 
   */
  async deleteTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tounamentId = parseInt(request.params.id);
    const tournament = await this.tournamentsRepository.delete(tounamentId);
    return reply.send(tournament);
  }

  /**
   * Create a tournament for a lobby
   * @param request 
   * @param reply 
   * @returns 
   */
  async createTournamentForLoby(request: FastifyRequest<{ Body: ReceivedData, Params: { type: string,format:string } }>, reply: FastifyReply) {  
    const { body, params } = request;
    const { type, format } = params;

    try {
      // 1. Validate data
      const validationError = this.validateLobRequest(body, type, format);
      if (validationError) {
        console.error("[TournamentsController] createTournamentForLoby() - Validation Error:", validationError);
        //return reply.code(400).send({ error: validationError });
        throw { status: 400, message: validationError  };
      }
      const tournamentLoby = await this.tournamentService.createTournament(body);
      // 2. Return the created tournament and its games
      return reply.status(201).send(tournamentLoby);
      
    } catch (err: any) {
      return reply.status(err.status || 500).send({ error: err.message });
    }
}

  /**
   * Validate the lobby request data for creating a tournament
   * @param data - The received data for the lobby
   * @param type - The type of lobby (local or remote)
   * @param format - The format of the game (classic or tournament)
   * @returns A string error message if validation fails, otherwise null
   */
  private validateLobRequest(data: ReceivedData, type: string, format: string): string | null {
    if (!data || !type || !format) return 'Missing required fields';
    const supportedTypes = ['local', 'remote'];
    const supportedFormats = ['classic', 'tournament'];

    if (!supportedTypes.includes(type)) return `Unsupported type: ${type}`;
    if (!supportedFormats.includes(format)) return `Unsupported format: ${format}`;

    if (!data.players ||( data.players.length < 2 && type !== 'local')) return 'Not enough players for a lobby';//Not enough players to generate a tournament

    return null; // no error
  }
}