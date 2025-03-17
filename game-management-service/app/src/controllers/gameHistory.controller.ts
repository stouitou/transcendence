import { FastifyRequest, FastifyReply } from 'fastify';
import  GameHistoryRepository  from '@src/repository/GameHistory.repository';
import { GameHistoryBody } from '@src/models/GameHistory';

export class GameHistoryController {
 private gameHistoryRepository = new GameHistoryRepository();
  constructor() {
    this.gameHistoryRepository = new GameHistoryRepository()
    this.createGameHistory = this.createGameHistory.bind(this);
    this.getGameHistorys = this.getGameHistorys.bind(this);
    this.getGameHistoryById = this.getGameHistoryById.bind(this);
    this.updateGameHistory = this.updateGameHistory.bind(this);
    this.deleteGameHistory = this.deleteGameHistory.bind(this);
  }
 
    async createGameHistory(request: FastifyRequest<{ Body: GameHistoryBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      const users = await this.gameHistoryRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getGameHistorys(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getGameHistorys ");
    const users = await  this.gameHistoryRepository.getAll();
        console.log("UserController getGameHistorys ",users);
    return reply.send(users);
  }


  async getGameHistoryById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);    
    const game = await this.gameHistoryRepository.getById(gameId);
        if (!game) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(game);
  }

  async updateGameHistory(request: FastifyRequest<{ Params: { id: string }, Body: GameHistoryBody }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { id, ...data } = requestBody;

    //check if user exists
   // const user = await UserRepository.update(gameId,requestBody);
    const user = await this.gameHistoryRepository.update({id:gameId,...data});//@TODO providers??
    console.log("UserController updateGameHistory ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  
  async deleteGameHistory(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    const user = await this.gameHistoryRepository.delete(gameId);
    return reply.send(user);
  }
}


