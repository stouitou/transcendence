import { FastifyRequest, FastifyReply } from 'fastify';
import  RoundRepository  from '@src/repository/Round.repository';
import { RoundBody } from '@src/models/Round';

export class RoundController {
 private roundRepository = new RoundRepository();
  constructor() {
    this.roundRepository = new RoundRepository()
    this.createRound = this.createRound.bind(this);
    this.getRounds = this.getRounds.bind(this);
    this.getRoundById = this.getRoundById.bind(this);
    this.updateRound = this.updateRound.bind(this);
    this.deleteRound = this.deleteRound.bind(this);
  }

    async createRound(request: FastifyRequest<{ Body: RoundBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.roundRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getRounds(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getRounds ");
       // const users = await UserRepository.getAll();
    const users = await  this.roundRepository.getAll();
        console.log("UserController getRounds ",users);
    return reply.send(users);
  }


  async getRoundById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);    
  //  const user = await this.userService.getRound(gameId);
    //const user = await UserRepository.getById(gameId);
    const game = await this.roundRepository.getById(gameId);
        if (!game) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(game);
  }

  async updateRound(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
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
    const user = await this.roundRepository.update({id:gameId,state});//@TODO providers??
    console.log("UserController updateRound ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  
  async deleteRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    //const user = await this.userService.deleteRound(gameId);
   // const user = await UserRepository.delete(gameId);
    const user = await this.roundRepository.delete(gameId);
    return reply.send(user);
  }
}


