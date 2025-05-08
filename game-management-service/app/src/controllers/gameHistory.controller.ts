import { FastifyRequest, FastifyReply } from 'fastify';
import  GameHistoryRepository  from '../repository/GameHistory.repository';
import { GameHistoryBody } from '../models/GameHistory';

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
    const gameHistory = await this.gameHistoryRepository.create(requestBody);
    if (!gameHistory) {
      return reply.status(404).send({ error: 'GameHistory not found' });
    }
    return reply.status(201).send(gameHistory);
  }

  async getGameHistorys(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--GameHistoryController getGameHistorys ");
    const gameHistorys = await  this.gameHistoryRepository.getAll();
        console.log("GameHistoryController getGameHistorys ",gameHistorys);
    return reply.send(gameHistorys);
  }


  async getGameHistoryById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameHistoryId = Number(request.params.id);    
    const gameHistory = await this.gameHistoryRepository.getById(gameHistoryId);
        if (!gameHistory) {
      return reply.status(404).send({ error: 'gameHistory not found' });
    }
    return reply.send(gameHistory);
  }

  async updateGameHistory(request: FastifyRequest<{ Params: { id: string }, Body: GameHistoryBody }>, reply: FastifyReply) {
    const gameHistoryId = Number(request.params.id);
    if (!gameHistoryId) {
      return reply.status(400).send({ error: 'Invalid GameHistory id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { id, ...data } = requestBody;
  
    const gameHistory = await this.gameHistoryRepository.update({id:gameHistoryId,...data});
    console.log("GameHistoryController updateGameHistory ",gameHistory);

    if (!gameHistory) {
      return reply.status(404).send({ error: 'gameHistory not found' });
    }
    return reply.send(gameHistory);
  }
  
  async deleteGameHistory(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameHistoryId = parseInt(request.params.id);
    const gameHistory = await this.gameHistoryRepository.delete(gameHistoryId);
    return reply.send(gameHistory);
  }
}


