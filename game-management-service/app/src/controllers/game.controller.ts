import { FastifyRequest, FastifyReply } from 'fastify';
import  GameRepository  from '../repository/Game.repository';
import { GameCreate } from '../models/Game';
import { IParams } from '../repository/helpers';


export class GameController {
  private gameRepository = new GameRepository();
    constructor() {
      this.gameRepository = new GameRepository()
   //   this.createGame = this.createGame.bind(this);
      this.getGames = this.getGames.bind(this);
      this.getGameById = this.getGameById.bind(this);
      this.getGamesByQuery = this.getGamesByQuery.bind(this);
      this.updateGame = this.updateGame.bind(this);
      this.deleteGame = this.deleteGame.bind(this);
   //   this.joinGameById = this.joinGameById.bind(this);
      this.createGameDocker = this.createGameDocker.bind(this);
    }

  async createGameDocker(request: FastifyRequest<{ Body: GameCreate }>, reply: FastifyReply) {

    const { ...requestBody } = request.body;
 //   const {authorization,cookie} = request.headers;
    const {type , format /* , mode */} = request.params as {type:string,format:string/* ,mode:string */};
    if (!type || !format /* || !mode */) {
      return reply.status(400).send({ error: 'Invalid request params' });
    }
    if (type !== 'local' && type !== 'remote') {
      return reply.status(400).send({ error: 'Invalid game type' });
    }
    if (format !== 'classic' && format !== 'tournament') {
      return reply.status(400).send({ error: 'Invalid game format' });
    }/* 
    if (mode !== 'normal' && mode !== 'rapide') {
      return reply.status(400).send({ error: 'Invalid game mode' });
    } */

    const games = await this.gameRepository.create({...requestBody,type,format/* ,mode */});
  //  console.log("GameController createGame ",games?'ok':'ko');
    if (!games) {
      return reply.status(404).send({ error: 'Game creation failed' });
    }
    return reply.status(201).send(games);
  }
/*   async createGame(request: FastifyRequest<{ Body: GameCreate }>, reply: FastifyReply) {  
    const { ...requestBody } = request.body;
 //   const {authorization,cookie} = request.headers;
    const {type , format} = request.params as {type:string,format:string};
    if (!type || !format) {
      return reply.status(400).send({ error: 'Invalid request params' });
    }
    if (type !== 'local' && type !== 'remote') {
      return reply.status(400).send({ error: 'Invalid game type' });
    }
    if (format !== 'classic' && format !== 'tournament') {
      return reply.status(400).send({ error: 'Invalid game format' });
    }
    if (!request.authenticatedUser){
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const games = await this.gameRepository.create({...requestBody,type,format});
    console.log("GameController createGame ",games?'ok':'ko');
    if (!games) {
      return reply.status(404).send({ error: 'Game creation failed' });
    }
    //  - update user state
    handleSetStats(type,format,request,reply);
    return reply.status(201).send(games);
  } */

  async getGames(request: FastifyRequest, reply: FastifyReply) { 
    try {
  //  console.log("--GameController getGames ");
    /* const games = await  this.gameRepository.getAll();
        console.log("GameController getGames ",games);
    return reply.send(games); */
     const query = request.query as IParams;
       // const options = new BuildOptions(query).getOptions();
        const games = await  this.gameRepository.getAllbyQuery(query);
  //      console.log("gamesController getgames ",games);
          return reply.send(games);
    } catch (error) {
      console.error("GameController getGames error ",error);
      return reply.status(407).send({ error: 'Internal server error' });
    }
  }

  async getGamesByQuery(request: FastifyRequest, reply: FastifyReply) {  
   // console.log("--GameController getGamesByQuery ");
    const query = request.query as IParams;
   // const options = new BuildOptions(query).getOptions();
    const games = await  this.gameRepository.getAllbyQuery(query);
 //       console.log("GameController getGames ",games);
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
  //  console.log("GameController updateGame ",game);

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


/*   async joinGameById(request: FastifyRequest<{Body:undefined, Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid gameId id' });
    }
    if (!request.authenticatedUser){
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id,avatar,name } = request.authenticatedUser;
    if (!id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
  const game = await this.gameRepository.addPlayer(gameId, id,name!,avatar!);
  console.log("GameController joinGameById ",game);

  if (!game) {
    return reply.status(404).send({ error: 'Game not found' });
  }
  //  - update user state
  handleSetStats(game.type,game.format,request,reply);
  return reply.send(game);
  } */

}


