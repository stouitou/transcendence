import { FastifyRequest, FastifyReply } from 'fastify';
import  UserRepository  from '../repository/User.repository';

import { pipeline } from 'node:stream';
import { promisify } from 'util';
import { createWriteStream } from 'node:fs';
import { UserStats } from '../models/User';
import Helpers, { IParams } from '@src/repository/helpers';
const pump = promisify(pipeline);

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
  userId: number;
  user: User;
}

const helpersUpdateStats=( userStats: UserStats, addValue : Partial<UserStats>) => {
  return {
      id: userStats.id,
      total_game_played: addValue.total_game_played? addValue.total_game_played + userStats.total_game_played: userStats.total_game_played,
      total_game_won : addValue.total_game_won? addValue.total_game_won + userStats.total_game_won: userStats.total_game_won,
      total_game_lost : addValue.total_game_lost? addValue.total_game_lost + userStats.total_game_lost: userStats.total_game_lost,
      total_game_draw : addValue.total_game_draw? addValue.total_game_draw + userStats.total_game_draw: userStats.total_game_draw,
      local_game_played : addValue.local_game_played? addValue.local_game_played + userStats.local_game_played: userStats.local_game_played,
      local_game_won : addValue.local_game_won? addValue.local_game_won + userStats.local_game_won: userStats.local_game_won,
      local_game_lost : addValue.local_game_lost? addValue.local_game_lost + userStats.local_game_lost: userStats.local_game_lost,
      local_game_draw : addValue.local_game_draw? addValue.local_game_draw + userStats.local_game_draw: userStats.local_game_draw,
      remote_game_played : addValue.remote_game_played? addValue.remote_game_played + userStats.remote_game_played: userStats.remote_game_played,
      remote_game_won : addValue.remote_game_won? addValue.remote_game_won + userStats.remote_game_won: userStats.remote_game_won,
      remote_game_lost : addValue.remote_game_lost? addValue.remote_game_lost + userStats.remote_game_lost: userStats.remote_game_lost,
      remote_game_draw : addValue.remote_game_draw? addValue.remote_game_draw + userStats.remote_game_draw: userStats.remote_game_draw,
      tournament_game_played : addValue.tournament_game_played? addValue.tournament_game_played + userStats.tournament_game_played: userStats.tournament_game_played,
      tournament_game_won : addValue.tournament_game_won? addValue.tournament_game_won + userStats.tournament_game_won: userStats.tournament_game_won,
      tournament_game_lost : addValue.tournament_game_lost? addValue.tournament_game_lost + userStats.tournament_game_lost: userStats.tournament_game_lost,
      tournament_game_draw : addValue.tournament_game_draw? addValue.tournament_game_draw + userStats.tournament_game_draw: userStats.tournament_game_draw,
      tournament_local_game_played : addValue.tournament_local_game_played? addValue.tournament_local_game_played + userStats.tournament_local_game_played: userStats.tournament_local_game_played,
      tournament_local_game_won : addValue.tournament_local_game_won? addValue.tournament_local_game_won + userStats.tournament_local_game_won: userStats.tournament_local_game_won,
      tournament_local_game_lost : addValue.tournament_local_game_lost? addValue.tournament_local_game_lost + userStats.tournament_local_game_lost: userStats.tournament_local_game_lost,
      tournament_local_game_draw : addValue.tournament_local_game_draw? addValue.tournament_local_game_draw + userStats.tournament_local_game_draw: userStats.tournament_local_game_draw,
      tournament_remote_game_played : addValue.tournament_remote_game_played? addValue.tournament_remote_game_played + userStats.tournament_remote_game_played: userStats.tournament_remote_game_played,
      tournament_remote_game_won : addValue.tournament_remote_game_won? addValue.tournament_remote_game_won + userStats.tournament_remote_game_won: userStats.tournament_remote_game_won,
      tournament_remote_game_lost : addValue.tournament_remote_game_lost? addValue.tournament_remote_game_lost + userStats.tournament_remote_game_lost: userStats.tournament_remote_game_lost,
      tournament_remote_game_draw : addValue.tournament_remote_game_draw? addValue.tournament_remote_game_draw + userStats.tournament_remote_game_draw: userStats.tournament_remote_game_draw
  };
}

//@TODO importer le bon type de GAME
interface Game {
  id: number;
  type: string;
  format: string;
  players: { id: number };
}

export interface UpdateUserBody extends User{}


export class UserController {
 private userRepository = new UserRepository();
  constructor() {
    this.userRepository = new UserRepository()
    this.createUser = this.createUser.bind(this);
    this.getUserMe = this.getUserMe.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getUserStatsById = this.getUserStatsById.bind(this);
    this.updateStatsById = this.updateStatsById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.updateUserAvatar = this.updateUserAvatar.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.removeFriend = this.removeFriend.bind(this);

    this.getUserGames = this.getUserGames.bind(this);
  }
  //constructor(private userService: UserService) {}

 /*  async  registerUser( request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply) {

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

    async createUser(request: FastifyRequest<{ Body: {name:string,avatar:string} }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.userRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getUsers ");
       // const users = await UserRepository.getAll();
    const users = await  this.userRepository.getAll();
        console.log("UserController getUsers ",users);
    return reply.send(users);
  }

  async getUserMe(request:  FastifyRequest, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      return reply.status(401).send({ error: 'User not authenticated' });
    }
    const user = await this.userRepository.getById(authenticatedUser.id!);
        if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }


  async getUserById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = Number(request.params.id);    
  //  const user = await this.userService.getUser(userId);
    //const user = await UserRepository.getById(userId);
    const user = await this.userRepository.getById(userId);
        if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }

  async getUserStatsById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    const user = await this.userRepository.getById(userId);
        if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user.userStats);
  }

  async updateStatsById(request:  FastifyRequest<{ Params: { id: string },Body:Partial<UserStats> }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    if (!userId) {
      return reply.status(400).send({ error: "Invalid user id" });
    }
    if (!request.body) {
      return reply.status(400).send({ error: "Invalid request body" });
    }
  
    // Récupérer l'utilisateur et ses statistiques
    const user = await this.userRepository.getById(userId);
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
  
    const userStats = user.userStats;
    if (!userStats) {
      return reply.status(404).send({ error: "UserStats not found" });
    }
  
    const {id,...requestBody } = request.body;
    // Additionner les valeurs transmises aux valeurs existantes
   
      // Mettre à jour les statistiques de l'utilisateur
    const userUpdated = await this.userRepository.update({
      id: userId,
      userStats: helpersUpdateStats(userStats, requestBody),
    });
  
    if (!userUpdated) {
      return reply.status(500).send({ error: "Failed to update user stats" });
    }
  
    return reply.send(userUpdated);
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserBody }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    if (!userId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { id,name,avatar,password,providers} = requestBody;

    //check if user exists
   // const user = await UserRepository.update(userId,requestBody);
    const user = await this.userRepository.update({id:userId,name,avatar,password});//@TODO providers??
    console.log("UserController updateUser ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  async updateMe(request: FastifyRequest<{ Body: UpdateUserBody }>, reply: FastifyReply) {
   
    console.log("UserController updateMe ");
    console.log("UserController body ",request.body);
    const userId = Number(request.authenticatedUser?.id);
    if (!userId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { id,name,avatar,password,providers} = requestBody;

    let updatedUser:any = {};
    name?updatedUser.name = name:updatedUser.name ="null";
    avatar?updatedUser.avatar = avatar:null;
    console.log("UserController updateMe updatedUser ",updatedUser);

    //check if user exists
   // const user = await UserRepository.update(userId,requestBody);
    const user = await this.userRepository.update({id:userId,...updatedUser});//@TODO providers??
    console.log("UserController updateUser ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  async updateUserAvatar(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.authenticatedUser?.id;
    console.log("UserController updateUserAvatar ",userId);
    if (!userId) {      
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    const data = await request.file();
    console.log("UserController updateUserAvatar ",data);
    if (!data) {
      console.log("UserController updateUserAvatar  no file");
      return reply.status(400).send({ error: 'Aucun fichier envoyégk' });
    }
    const uploadPath = `${process.cwd()}/uploads/${userId}-${data.filename}`;
    console.log("UserController updateUserAvatar ",uploadPath);
    await pump(data.file, createWriteStream(uploadPath));

   // const user = await this.userRepository.update({...request.authenticatedUser,avatar:`uploads/${userId}-${data.filename}`});
    const user = await this.userRepository.update({id:userId, avatar:`/uploads/${userId}-${data.filename}`});
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.send(user);
    }

    //add Friend
    async addFriend(request: FastifyRequest<{/*  Params: { id: string}, */Body:{ friendId:string} }>, reply: FastifyReply) {
     // const userId = parseInt(request.params.id);
     const userId = Number(request.authenticatedUser?.id);
     if (!userId) {
       return reply.status(400).send({ error: 'Invalid user id' });
     }
      const friendId = parseInt(request.body.friendId);
      //const user = await this.userService.deleteUser(userId);
     // const user = await UserRepository.delete(userId);
      const user = await this.userRepository.addFriend(userId,friendId);
      return reply.send(user);
    }
    //remove Friend
    async removeFriend(request: FastifyRequest<{/*  Params: { id: string }, */Body:{ friendId:string}  }>, reply: FastifyReply) {
     // const userId = parseInt(request.params.id);
     const userId = Number(request.authenticatedUser?.id);
     if (!userId) {
       return reply.status(400).send({ error: 'Invalid user id' });
     }
      const friendId = parseInt(request.body.friendId);
      //const user = await this.userService.deleteUser(userId);
     // const user = await UserRepository.delete(userId);
      const user = await this.userRepository.removeFriend(userId,friendId);
      return reply.send(user);
    }


  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = parseInt(request.params.id);
    //const user = await this.userService.deleteUser(userId);
   // const user = await UserRepository.delete(userId);
    const user = await this.userRepository.delete(userId);
    return reply.send(user);
  }
 /*  async requestQuery(request: FastifyRequest<{ Body: {name:string,avatar:string} }>, reply: FastifyReply) {
 const date = new Date().toISOString();
    const sql = `INSERT INTO users (name, avatar, created_at, updated_at, role) VALUES (?, ?, ?, ?, ?)`;// VALUES (?, ?, ?, ?, ?)
   
    const values = [request.body.name, request.body.avatar, date, date , "user"];
    //`[request.body.name,request.body.avatar]`
    try {
      const user = await UserRepository.queryRaw(sql,values);
      return reply.status(201).send(user);
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  } */


    /**
     * 
     * @param request 
     * @param reply 
     * @returns 
     */

  async getUserGames(request: FastifyRequest, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      return reply.status(401).send({ error: 'User not authenticated' });
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserGames request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString<Game>(query,{players:{id:userId}});
       

   try {
    const authHeader = request.headers.authorization;
    const response = await fetch(`http://game-management-service:3000/api/game-management-service/games?${builQuery}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader?? '',
      },
    });

    if (!response.ok) {
      console.error("Error fetching games:", response);
      throw new Error(`[getUserGames] Failed to fetch games: ${response.statusText}`);
    }

    const games = await response.json();
    return reply.code(200).send(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return reply.code(500).send({ error: "Failed to fetch games" });
  }
}
async getUserGameById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    const gameId = request.params.id;
    const response = await fetch(`http://game-management-service:3000/api/games/${gameId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader?? '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game: ${response.statusText}`);
    }

    const game = await response.json();
    return reply.code(200).send(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return reply.code(500).send({ error: "Failed to fetch game" });
  }
}

async getUserFriends(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const response = await fetch('http://game-management-service:3000/api/tournaments', {
        method: 'GET',
        headers: {
          'Authorization': authHeader?? '',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
      }
  
      const tournaments = await response.json();
      return reply.code(200).send(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      return reply.code(500).send({ error: "Failed to fetch tournaments" });
    }
  }

  async getUserTournaments(request: FastifyRequest, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      return reply.status(401).send({ error: 'User not authenticated' });
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserTournaments request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString/* <Game> */(query,{players:{id:userId}});//@TODO Type Tournaments
    try {
      const authHeader = request.headers.authorization;
      const response = await fetch(`http://game-management-service:3000/api/game-management-service/tournaments?${builQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader?? '',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch tournament: ${response.statusText}`);
      }
  
      const tournament = await response.json();
      return reply.code(200).send(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return reply.code(500).send({ error: "Failed to fetch tournament" });
    }
  }
  async getUserTournamentById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const tournamentId = request.params.id;
      const response = await fetch(`http://tournament_management_service:3000/api/tournaments/${tournamentId}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader?? '',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch tournament: ${response.statusText}`);
      }
  
      const tournament = await response.json();
      return reply.code(200).send(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return reply.code(500).send({ error: "Failed to fetch tournament" });
    }
  }


}


