import { FastifyRequest, FastifyReply } from 'fastify';
import  GameRepository  from '@src/repository/Game.repository';
import { GameBody } from '@src/models/Game';
import { UserStats } from '@src/models/User';

const handlefetchStats = async (authorization:string|undefined,cookie : string|undefined,userId:number, dataStats:Partial<UserStats>) => {
  try {
      const response = await fetch(`http://user-management-service:3000/api/users/${userId}/stats`, {
    method: 'PUT',
    headers: {
      "authorization":authorization??'',
      'cookie': cookie??'',
      'content-type': 'application/json',
    },
    body: JSON.stringify({...dataStats}),
  })
      if (!response.ok) {
          throw new Error('Failed to fetch user data stats');
      }
      const data = await response.json();
      console.log("GameController handlefetch data stats ",data);
      return data;
  }
  catch (error) {
      console.error('Error fetching user data stats:', error,userId);
      throw error;
  }
}

const handleSetStats = async (type:string,format:string,request:FastifyRequest<{ Body?: GameBody }>,reply:FastifyReply) => {

 // const { ...requestBody } = request.body;
  const {authorization,cookie} = request.headers;
  const playerId = request.authenticatedUser?.id;
  if (!playerId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  //  - update user state
      if (type === "local" && format === "classic") {
        //   requestBody.players.length
     //   const playerId = requestBody.players.at(0) as number;
           const updatedStats = await handlefetchStats(authorization,cookie,playerId,{
             total_game_played: 1,
             local_game_played: 1,
             remote_game_played: 0,
           });
             console.log("GameController createGame updatedStats ");
             const user =  updatedStats;
             if (!user) {
               return reply.status(404).send({ error: 'User not found' });
             }
     
         }
         if (type === "remote" && format === "classic") {
           // mettre à jour les stats des l'utilisateurs requestBody.players[]
        //   for (const playerId of requestBody.players as number[]) {
             const updatedStats = await handlefetchStats(authorization,cookie,playerId,{
               total_game_played: 1,
               local_game_played: 0,
               remote_game_played: 1,
             });
             console.log("GameController createGame updatedStats ");
             const user =  updatedStats;
             if (!user) {
               return reply.status(404).send({ error: 'User not found' });
             }
          // }
     
         }
     
         if (type === "local" && format === "tournament") {
          // const playerId = requestBody.players.at(0) as number;
           const updatedStats = await handlefetchStats(authorization,cookie,playerId,{
             tournament_game_played: 1,
             tournament_local_game_played: 1,
             tournament_remote_game_played: 0,
           });
             console.log("GameController createGame updatedStats ");
             const user =  updatedStats;
             if (!user) {
               return reply.status(404).send({ error: 'User not found' });
             }
     
         }
         if (type === "remote" && format === "tournament") {
                 // mettre à jour les stats des l'utilisateurs requestBody.players[]
            // for (const playerId of requestBody.players as number[]) {
               const updatedStats = await handlefetchStats(authorization,cookie,playerId,{
                 tournament_game_played: 1,
                 tournament_local_game_played: 0,
                 tournament_remote_game_played: 1,
               });
               console.log("GameController createGame updatedStats ");
               const user =  updatedStats;
               if (!user) {
                 return reply.status(404).send({ error: 'User not found' });
               }
            // }
         }
        }

export class GameController {
  private gameRepository = new GameRepository();
    constructor() {
      this.gameRepository = new GameRepository()
      this.createGame = this.createGame.bind(this);
      this.getGames = this.getGames.bind(this);
      this.getGameById = this.getGameById.bind(this);
      this.updateGame = this.updateGame.bind(this);
      this.deleteGame = this.deleteGame.bind(this);
      this.joinGameById = this.joinGameById.bind(this);
    }

  async createGame(request: FastifyRequest<{ Body: GameBody }>, reply: FastifyReply) {  
    const { ...requestBody } = request.body;
 //   const {authorization,cookie} = request.headers;
    const {type , format , mode} = request.params as {type:string,format:string,mode:string};
    if (!type || !format || !mode) {
      return reply.status(400).send({ error: 'Invalid request params' });
    }
    if (type !== 'local' && type !== 'remote') {
      return reply.status(400).send({ error: 'Invalid game type' });
    }
    if (format !== 'classic' && format !== 'tournament') {
      return reply.status(400).send({ error: 'Invalid game format' });
    }
    if (mode !== 'normal' && mode !== 'rapide') {
      return reply.status(400).send({ error: 'Invalid game mode' });
    }
    if (!request.authenticatedUser){
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const games = await this.gameRepository.create({...requestBody,type,format,mode});
    console.log("GameController createGame ",games?'ok':'ko');
    if (!games) {
      return reply.status(404).send({ error: 'Game creation failed' });
    }
    //  - update user state
    handleSetStats(type,format,request,reply);
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
    const { state/* ,local_players */ } = requestBody; //@TODO : à revoir

    const game = await this.gameRepository.update({id:gameId,state/* ,local_players */});
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


  async joinGameById(request: FastifyRequest<{Body:undefined, Params: { id: string }/* , Body: {state:string} */ }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid gameId id' });
    }
    if (!request.authenticatedUser){
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.authenticatedUser;
    if (!id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
  const game = await this.gameRepository.addPlayer(gameId, id);
  console.log("GameController joinGameById ",game);

  if (!game) {
    return reply.status(404).send({ error: 'Game not found' });
  }
  //  - update user state
  handleSetStats(game.type,game.format,request,reply);
  return reply.send(game);
  }

}


