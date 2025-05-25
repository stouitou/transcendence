import { FastifyRequest, FastifyReply } from 'fastify';
import  GameHistoryRepository  from '../repository/GameHistory.repository';
import { GameHistoryBody } from '../models/GameHistory';
import {  Players } from '../models/Players';
import UserRepository from '@src/repository/User.repository';
import { User, UserStats } from '@src/models/User';

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
    console.log("[GameHistoryController] updateGameHistory ",gameHistory);

    if (!gameHistory) {
      return reply.status(404).send({ error: 'gameHistory not found' });
    }
   
      const {type,format,players} = gameHistory as {format:"classic"|"tournament",type:'local'|'remote',players:Players[]};
       const games = await Promise.all(players.map(async (player: Players) => {
        console.log(" GameRepository.updateGameHistory()  --STATS-- user--",player);
        const { user } = player;
        if (!user || user === null || typeof user === 'undefined' || typeof user === 'number') {
          console.warn(" GameRepository.updateGameHistory()  --STATS-- player is null or undefined",player);
          return null; // Skip if user is not defined
        }
        console.log(" GameRepository.updateGameHistory()  --STATS-- user--",user);
        const fieldName = gameHistory.winner? user.name == gameHistory.winner? `won`: `lost` : `draw`;

        const userStatsData = buildUserStatsResult(user, format, type, fieldName);

        const userUpdated = await (new UserRepository()).update(userStatsData);
        return userUpdated;
       }));
       console.log(" GameRepository.create()  --gameCreated-STATS- UPDATED--",games)
    
    return reply.send(gameHistory);
  }
  
  async deleteGameHistory(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameHistoryId = parseInt(request.params.id);
    const gameHistory = await this.gameHistoryRepository.delete(gameHistoryId);
    return reply.send(gameHistory);
  }
}

export const buildUserStatsResult = (user: User, format:"classic"|"tournament",type:'local'|'remote', fieldName: `won`| `lost` | `draw`) => {
  const userStats:UserStats = { 
    ...user.userStats,
    [`${format}_${type}_game_${fieldName}`]: user.userStats[`${format}_${type}_game_${fieldName}`] + 1,
    // [`<classic|tournament>_<local|remote>_game_<won|lost|draw>`]: user.userStats[`<classic|tournament>_<local|remote>_game_<won|lost|draw>`] + 1,

  };
  //si le format est "classic" , on incrémente le total_game_<won|lost|draw>
  if (format === "classic") {
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
