import { FastifyRequest, FastifyReply } from 'fastify';
import  UserRepository  from '../repository/User.repository';

import { pipeline } from 'node:stream';
import { promisify } from 'util';
import { createWriteStream } from 'node:fs';
import { UserStats } from '../models/User';
import Helpers, { IParams } from '../repository/helpers';
import { AuthServiceController } from './authService.controller';
import { chmod } from 'node:fs/promises';
import { AuthError, NotFoundError, ValidationError } from '../Errors/errors';
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

/* const helpersUpdateStats=( userStats: UserStats, addValue : Partial<UserStats>) => {
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
} */

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
    this.getUserMeById = this.getUserMeById.bind(this);
    this.getUserStatsById = this.getUserStatsById.bind(this);
    this.updateStatsById = this.updateStatsById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.deleteUserMe = this.deleteUserMe.bind(this);
    this.updateUserAvatar = this.updateUserAvatar.bind(this);
    this.updateUserAvatarById = this.updateUserAvatarById.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.addFriendByUserName = this.addFriendByUserName.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.getUsersLeaderboard = this.getUsersLeaderboard.bind(this);

    this.getUserGames = this.getUserGames.bind(this);
    this.getUserGameById = this.getUserGameById.bind(this);

    this.getUserTournamentsByUserId = this.getUserTournamentsByUserId.bind(this);
  }

    async createUser(request: FastifyRequest<{ Body: {name:string,avatar:string} }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.userRepository.create(requestBody);
      if (!users) {
      //  return reply.status(404).send({ error: 'User not found' });
        throw new ValidationError("User not created", "request.body");

      }
      return reply.status(201).send(users);
    }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {  
   try {
     console.log("--UserController getUsers ");
       // const users = await UserRepository.getAll();
        const query = request.query as IParams;
       // const options = new BuildOptions(query).getOptions();
        const users = await  this.userRepository.getAllbyQuery(query);
        if (!users) {
          throw new ValidationError("Users not found", "request.query");
        }
      return reply.send(users);
    } catch (error) {
      console.error("UserController getUsers error ",error);
      throw new ValidationError("Malformed response from user service", "request.query");
    }
  }

  async getUserMe(request:  FastifyRequest, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
    //  return reply.status(401).send({ error: 'User not authenticated' });
       // Fastify catchera cette erreur
       throw new AuthError("User not authenticated");
    }
    const user = await this.userRepository.getById(authenticatedUser.id!);
        if (!user) {
      //return reply.status(404).send({ error: 'User not found' });
      throw new NotFoundError("User not found");
    }
    return reply.send(user);
  }


  async getUserById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    const user = await this.userRepository.getById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
    }
    return reply.send(user);
  }

  async getUserMeById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    const user = await this.userRepository.getById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const {id,avatar,name,role,created_at,level} = user;
    return reply.send({id,avatar,name,role,created_at,level});
  }

  async getUserStatsById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    const user = await this.userRepository.getById(userId);
     if (!user) {
        throw new NotFoundError("User not found");
    }
    return reply.send(user.userStats);
  }
  async getUsersLeaderboard(request:  FastifyRequest, reply: FastifyReply) {
    const leaderboard = await this.userRepository.getUsersLeaderboard();
    if (!leaderboard) {
      throw new NotFoundError("leaderboard not found");
    }
    return reply.send(leaderboard);
  }

  async updateStatsById(request:  FastifyRequest<{ Params: { id: string },Body:Partial<UserStats> }>, reply: FastifyReply) {
    const userId = Number(request.params.id);
    if (!userId) {
      throw new ValidationError("Invalid user id", "request.params.id");
    }
    if (!request.body) {
      throw new ValidationError("Invalid request body", "request.body");
    }
  
    // Récupérer l'utilisateur et ses statistiques
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userStats = user.userStats;
    if (!userStats) {
      throw new NotFoundError("UserStats not found");
    }
  
    const {id,...requestBody } = request.body;
    // Additionner les valeurs transmises aux valeurs existantes
   
      // Mettre à jour les statistiques de l'utilisateur
    const userUpdated = await this.userRepository.update({
      id: userId,
      //userStats: helpersUpdateStats(userStats, requestBody),
    });
  
    if (!userUpdated) {
      throw new ValidationError("Failed to update user stats", "request.body");
    }
  
    return reply.send(userUpdated);
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserBody&{role?:string} }>, reply: FastifyReply) {
    const admin = request.authenticatedUser?.role === 'admin';
    if (!admin) {
      throw new AuthError("Unauthorized");
    }

    const userId = Number(request.params.id);
    if (!userId) {
      throw new ValidationError("Invalid user id", "request.params.id");
    }
    if (!request.body) {
      throw new ValidationError("Invalid request body", "request.body");
    }
    const { ...requestBody } = request.body;
    const { id,name,avatar,password,providers,role} = requestBody;

    //check if user exists
   // const user = await UserRepository.update(userId,requestBody);
    const user = await this.userRepository.update({id:userId,name,avatar,password,role});//@TODO providers??
    console.log("UserController updateUser ",user);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return reply.send(user);
  }
  async updateMe(request: FastifyRequest<{ Body: UpdateUserBody }>, reply: FastifyReply) {
   
    console.log("UserController updateMe ");
    console.log("UserController body ",request.body);
    const userId = Number(request.authenticatedUser?.id);
    if (!userId) {
      throw new ValidationError("Invalid user id", "request.authenticatedUser.id");
    }
    if (!request.body) {
      throw new ValidationError("Invalid request body", "request.body");
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
      throw new NotFoundError("User not found");
    }
    return reply.send(user);
  }



  async updateMePassword(request: FastifyRequest, reply: FastifyReply) {
     const userId = Number(request.authenticatedUser?.id);
    if (!userId) {
      throw new ValidationError("Invalid user id", "request.authenticatedUser.id");
    }
    if (!request.body) {
      throw new ValidationError("Invalid request body", "request.body");
    }
    const { ...requestBody } = request.body as { oldPassword: string, newPassword: string };
    const { oldPassword, newPassword} = requestBody;
    try {
      const authServiceController = new AuthServiceController();
      const result = await authServiceController.updateMePassword(request/* , reply */);
      return reply.code(204).send();
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      throw new ValidationError("Failed to update password", "request.body");
    //  return reply.status(500).send({ error: error.message });
    }
  }

  
  async updateUserAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
    const userId = request.authenticatedUser?.id;
    console.log("UserController updateUserAvatar ",userId);
    if (!userId) { 
      throw new AuthError("Invalid user id user not authenticated");
    }
    const data = await request.file();
    console.log("UserController updateUserAvatar ",data);
    if (!data) {
      console.log("UserController updateUserAvatar  no file");
      throw new ValidationError("No file uploaded", "request.file");
    }
    //get extension
    const fileExtension = data.filename.split('.').pop();
    if (!fileExtension) {
      console.log("UserController updateUserAvatar  no file extension");
      throw new ValidationError("No file extension", "request.file");
    }
    //const uploadPath = `${process.cwd()}/uploads/${userId}-${data.filename}`;
    const uploadPath = `${process.cwd()}/uploads/${userId}-avatar.${fileExtension}`;
    console.log("UserController updateUserAvatar ",uploadPath);
    await pump(data.file, createWriteStream(uploadPath));
// Fix permissions (lecture-écriture pour le propriétaire, lecture pour les autres)
await chmod(uploadPath, 0o644);
   // const user = await this.userRepository.update({...request.authenticatedUser,avatar:`uploads/${userId}-${data.filename}`});
    const user = await this.userRepository.update({id:userId, avatar:`/uploads/${userId}-avatar.${fileExtension}`});
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return reply.send(user);
    }
    catch (error) {
      console.error('Error uploading avatar:', error);
      throw new ValidationError("Error uploading avatar", "request.file");
    }
  }
  /**
   * admin updateUserAvatar
   * @param request
   * @param reply
   * @returns
   * @TODO
   * */
  async updateUserAvatarById(request: FastifyRequest, reply: FastifyReply) {
    const admin = request.authenticatedUser?.role === 'admin';
    if (!admin) {
      throw new AuthError("Unauthorized");
    }
    
    const userId = (request.params as {id:number}).id;
    console.log("UserController updateUserAvatar ",userId);
    if (!userId) {
      throw new ValidationError("Invalid user id", "request.params.id");
    }
    const data = await request.file();
    console.log("UserController updateUserAvatar ",data);
    if (!data) {
      console.log("UserController updateUserAvatar  no file");
      throw new ValidationError("No file uploaded", "request.file");
    }
    //get extension
    const fileExtension = data.filename.split('.').pop();
    if (!fileExtension) {
      console.log("UserController updateUserAvatar  no file extension");
      throw new ValidationError("No file extension", "request.file");
    }
    //const uploadPath = `${process.cwd()}/uploads/${userId}-${data.filename}`;
    const uploadPath = `${process.cwd()}/uploads/${userId}-avatar.${fileExtension}`;
    console.log("UserController updateUserAvatar ",uploadPath);
    await pump(data.file, createWriteStream(uploadPath));
// Fix permissions (lecture-écriture pour le propriétaire, lecture pour les autres)
await chmod(uploadPath, 0o644);

   // const user = await this.userRepository.update({...request.authenticatedUser,avatar:`uploads/${userId}-${data.filename}`});
    const user = await this.userRepository.update({id:userId, avatar:`/uploads/${userId}-avatar.${fileExtension}`});
   // const user = await this.userRepository.update({id:userId, avatar:`/uploads/${userId}-${data.filename}`});
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return reply.send(user);
    }
    //add Friend
    async addFriendByUserName(request: FastifyRequest<{/*  Params: { id: string}, */Body:{ friendName:string} }>, reply: FastifyReply) {
     // const userId = parseInt(request.params.id);
     try {
        const userId = Number(request.authenticatedUser?.id);
        if (!userId) {
          throw new AuthError("Invalid user id user not authenticated");
        }
          const friendName = request.body.friendName;

          const friend = await this.userRepository.getOneByParams({ name: friendName })
          if (!friend) {
            throw new ValidationError("Friend not found", "friendName");
          }
          //const user = await this.userService.deleteUser(userId);
        // const user = await UserRepository.delete(userId);
          const user = await this.userRepository.addFriend(userId,friend.id);
          //if success return user
          return reply.send(user);
      } catch (error) {
          console.error('Error adding friend by username:', error);
          throw new ValidationError("Failed to add friend", "friendName");
      }
    }

    async addFriend(request: FastifyRequest<{/*  Params: { id: string}, */Body:{ friendId:string} }>, reply: FastifyReply) {
     // const userId = parseInt(request.params.id);
     const userId = Number(request.authenticatedUser?.id);
     if (!userId) {
       throw new AuthError("Invalid user id user not authenticated");
     }
      const friendId = parseInt(request.body.friendId);
      //const user = await this.userService.deleteUser(userId);
     // const user = await UserRepository.delete(userId);
      const user = await this.userRepository.addFriend(userId,friendId);
      if (!user) {
        throw new ValidationError("Friend not found", "request.body.friendId");
      }
      return reply.send(user);
    }
    //remove Friend
    async removeFriend(request: FastifyRequest<{Body:{ friendId:string}  }>, reply: FastifyReply) {
     try {
     const userId = Number(request.authenticatedUser?.id);
     if (!userId) {
       throw new AuthError("Invalid user id user not authenticated");
     }
      const friendId = parseInt(request.body.friendId);
      console.log("UserController removeFriend ",userId,friendId);
      console.log("UserController removeFriend request.body",userId,request.body);
      //const user = await this.userService.deleteUser(userId);
     // const user = await UserRepository.delete(userId);
      const user = await this.userRepository.removeFriend(userId,friendId);
      if (!user) {
        throw new ValidationError("Friend not found", "request.body.friendId");
      }
      return reply.send(user);
    }
    catch (error) {
      console.error('Error removing friend:', error);
      throw new ValidationError("Failed to remove friend", "request.body");
    }
  }


  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = parseInt(request.params.id);
    //const user = await this.userService.deleteUser(userId);
   // const user = await UserRepository.delete(userId);
    const user = await this.userRepository.delete(userId); 
    if (!user) {
      throw new ValidationError("User not found", "request.params.id");
    }
    return reply.send(user);
  }
    async deleteUserMe(request: FastifyRequest, reply: FastifyReply) {
   try {
     const userId = Number(request.authenticatedUser?.id);
     if (!userId) {
       throw new AuthError("Invalid user id user not authenticated");
     }
    const user = await this.userRepository.delete(userId);
    if (!user) {
      throw new ValidationError("User not found", "request.authenticatedUser.id");
    }
    console.log("UserController deleteUserMe ",user);
    return reply.send(user);
   } catch (error) {
      console.error('Error deleting user:', error);
      throw new ValidationError("Failed to delete user", "request.body");
    }
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
      throw new AuthError("User not authenticated");
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      throw new AuthError("User not authenticated - Invalid user id");
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserGames request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString<Game>(query,{players:{id:userId}});
       

   try {
    const authHeader = request.headers.authorization;
    const response = await fetch(`http://game-management-service:3000/internal/games?${builQuery}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader?? '',
      },
    });

    if (!response.ok) {
      console.error("Error fetching games:", response);
      throw new NotFoundError(`[getUserGames] Failed to fetch games: ${response.statusText}`);
    }
    const games = await response.json();
    return reply.code(200).send(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}
  async getUserGamesByPlayerId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      throw new AuthError("User not authenticated");
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      throw new AuthError("Invalid user id");
    }
    const playerId = parseInt(request.params.id);
    if (!playerId) {
      throw new ValidationError("Invalid player id", "request.params.id");
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserGames request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString<Game>(query,{players:{id:playerId}});
       

   try {
    const authHeader = request.headers.authorization;
    const response = await fetch(`http://game-management-service:3000/internal/games?${builQuery}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader?? '',
      },
    });

    if (!response.ok) {
      console.error("Error fetching games:", response);
      throw new NotFoundError(`[getUserGames] Failed to fetch games: ${response.statusText}`);
    }

    const games = await response.json();
    return reply.code(200).send(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  //  return reply.code(500).send({ error: "Failed to fetch games" });
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
      throw new NotFoundError(`[getUserGameById] Failed to fetch game: ${response.statusText}`);
    }

    const game = await response.json();
    return reply.code(200).send(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

  async getUserTournaments(request: FastifyRequest, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      throw new AuthError("User not authenticated");
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      throw new AuthError("Invalid user id");
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserTournaments request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString/* <Game> */(query,{players:{id:userId}});//@TODO Type Tournaments
    try {
      const authHeader = request.headers.authorization;
      const response = await fetch(`http://game-management-service:3000/internal/tournaments?${builQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader?? '',
        },
      });
  
      if (!response.ok) {
        throw new NotFoundError(`[getUserTournaments] Failed to fetch tournaments: ${response.statusText}`);
      }
  
      const tournament = await response.json();
      return reply.code(200).send(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      throw error;
    }
  }
    async getUserTournamentsByUserId(request: FastifyRequest<{Params:{id:string}}>, reply: FastifyReply) {
    const authenticatedUser = request.authenticatedUser;
    if (!authenticatedUser) {
      throw new AuthError("User not authenticated");
    }
    const userId = authenticatedUser.id;
    if (!userId) {
      throw new AuthError("Invalid user id");
    }
     const playerId = parseInt(request.params.id);
    if (!playerId) {
      throw new ValidationError("Invalid player id", "request.params.id");
    }
    //add userId to query filters {"id":userId}
        console.log("[UserController] getUserTournaments request.query ",request.query);
        const query = request.query as IParams;
        const builQuery = Helpers.buildQueryString/* <Game> */(query,{players:{id:playerId}});//@TODO Type Tournaments
    try {
      const authHeader = request.headers.authorization;
      const response = await fetch(`http://game-management-service:3000/internal/tournaments?${builQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader?? '',
        },
      });
  
      if (!response.ok) {
        throw new NotFoundError(`[getUserTournaments] Failed to fetch tournament: ${response.statusText}`);
      }
  
      const tournament = await response.json();
      return reply.code(200).send(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      throw error;
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
        throw new NotFoundError(`[getUserTournamentById] Failed to fetch tournament: ${response.statusText}`);
      }

      const tournament = await response.json();
      return reply.code(200).send(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      throw error;
    }
  }


}


