import { FastifyRequest, FastifyReply } from 'fastify';
import  GameRepository  from '@src/repository/Game.repository';
import { GameBody } from '@src/models/Game';
/* 

export type User = {
  id:        number;
  email?:     string;
  name?:      string;
  avatar?:    string;
  password?:  string;
  providers?:  AutProvider[];
  createdAt: Date;
  updatedAt: Date;
};

export type FullUser = User & {// moche mais fera le taf pour le moment
  providers: AutProvider[];
}

export type AutProvider = {
  id: string;
  provider: string;
  providerId: string;
  gameId: number;
  user: User;
}

interface UpdateGameBody extends User{}
 */

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
  //constructor(private userService: UserService) {}

 /*  async  registerUser( request: FastifyRequest<{ Body: CreateGameBody }>, reply: FastifyReply) {

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

    async createGame(request: FastifyRequest<{ Body: GameBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.gameRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getGames(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getGames ");
       // const users = await UserRepository.getAll();
    const users = await  this.gameRepository.getAll();
        console.log("UserController getGames ",users);
    return reply.send(users);
  }


  async getGameById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);    
  //  const user = await this.userService.getGame(gameId);
    //const user = await UserRepository.getById(gameId);
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

    //check if user exists
   // const user = await UserRepository.update(gameId,requestBody);
    const user = await this.gameRepository.update({id:gameId,state});//@TODO providers??
    console.log("UserController updateGame ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  
  async deleteGame(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    //const user = await this.userService.deleteGame(gameId);
   // const user = await UserRepository.delete(gameId);
    const user = await this.gameRepository.delete(gameId);
    return reply.send(user);
  }
}


