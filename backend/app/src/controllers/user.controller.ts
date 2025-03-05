import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository } from '@src/repository/UserRepository';


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

interface UpdateUserBody extends User{}


export class UserController {
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
      const users = await UserRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {  
    console.log("UserController getUsers ");
        const users = await UserRepository.getAll();
        console.log("UserController getUsers ",users);
    return reply.send(users);
  }


  async getUserById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = parseInt(request.params.id);    
  //  const user = await this.userService.getUser(userId);
    const user = await UserRepository.getById(userId);
        if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserBody }>, reply: FastifyReply) {
    const userId = parseInt(request.params.id);
    const { ...requestBody } = request.body;
    const { id,email,name,avatar,password,providers} = requestBody;

    //check if user exists
    const user = await UserRepository.update(userId,requestBody);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = parseInt(request.params.id);
    //const user = await this.userService.deleteUser(userId);
    const user = await UserRepository.delete(userId);
    return reply.send(user);
  }
  async requestQuery(request: FastifyRequest<{ Body: {name:string,avatar:string} }>, reply: FastifyReply) {
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
  }

}


