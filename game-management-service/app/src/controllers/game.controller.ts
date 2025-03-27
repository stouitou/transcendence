import { FastifyRequest, FastifyReply } from 'fastify';
import  GameRepository  from '@src/repository/Game.repository';
import { GameBody } from '@src/models/Game';

export class GameController {
  private gameRepository = new GameRepository();
    constructor() {
      this.gameRepository = new GameRepository()
      this.createGame = this.createGame.bind(this);
      this.getGames = this.getGames.bind(this);
      this.getGameById = this.getGameById.bind(this);
      this.updateGame = this.updateGame.bind(this);
      this.deleteGame = this.deleteGame.bind(this);
    }

  async createGame(request: FastifyRequest<{ Body: GameBody }>, reply: FastifyReply) {  
    const { ...requestBody } = request.body;
    const games = await this.gameRepository.create(requestBody);
    if (!games) {
      return reply.status(404).send({ error: 'Game creation failed' });
    }
    return reply.status(201).send(games);
  }

  async getGames(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--GameController getGames ");
    const games = await  this.gameRepository.getAll();
        console.log("GameController getGames ",games);
    return reply.send(games);
  }

  async getGameById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    const game = await this.gameRepository.getById(gameId);
        if (!game) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(game);
  }

  async updateGame(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { state } = requestBody;

    const game = await this.gameRepository.update({id:gameId,state});
    console.log("GameController updateGame ",game);

    if (!game) {
      return reply.status(404).send({ error: 'Game not found' });
    }
    return reply.send(game);
  }

  async deleteGame(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    const game = await this.gameRepository.delete(gameId);
    return reply.send(game);
  }
}


