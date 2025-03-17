import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '@src/repository/Tournament.repository';
import { TournamentsBody } from '@src/models/Tournaments';

export class TournamentsController {
 private tournamentsRepository = new TournamentsRepository();
  constructor() {
    this.tournamentsRepository = new TournamentsRepository()
    this.createTournament = this.createTournament.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournament = this.updateTournament.bind(this);
    this.deleteTournament = this.deleteTournament.bind(this);
  }
  //constructor(private userService: UserService) {}

 /*  async  registerUser( request: FastifyRequest<{ Body: CreateTournamentBody }>, reply: FastifyReply) {

    const { ...requestBody } = request.body;
    const { name, email } = requestBody;
    console.log("UserController registerUser ", name, email);
    try {
      const user = await this.userService.registerUser(name, email);
      return reply.status(201).send(user);
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  } */

    async createTournament(request: FastifyRequest<{ Body: TournamentsBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.tournamentsRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getTournaments(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getTournaments ");
       // const users = await UserRepository.getAll();
    const users = await  this.tournamentsRepository.getAll();
        console.log("UserController getTournaments ",users);
    return reply.send(users);
  }


  async getTournamentById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);    
  //  const user = await this.userService.getTournament(gameId);
    //const user = await UserRepository.getById(gameId);
    const game = await this.tournamentsRepository.getById(gameId);
        if (!game) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(game);
  }

  async updateTournament(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { state } = requestBody;

    //check if user exists
   // const user = await UserRepository.update(gameId,requestBody);
    const user = await this.tournamentsRepository.update({id:gameId,state});//@TODO providers??
    console.log("UserController updateTournament ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  
  async deleteTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    //const user = await this.userService.deleteTournament(gameId);
   // const user = await UserRepository.delete(gameId);
    const user = await this.tournamentsRepository.delete(gameId);
    return reply.send(user);
  }
}


