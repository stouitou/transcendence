import { initDatabase } from '../models/databaseInit';
import { SQLITE_DATABASE_NAME } from "../services/database.service";
type DBForeignKeys = {
  column: string;
  references: string;
  onDelete: string;
};
type DBColumn = {
  name: string;
  type: string;
};
class UserModel {
  constructor() {
/*     initDatabase().then((data) => {
      console.log(data);
    }); */
    this.fetchJSON = this.fetchJSON.bind(this);
    this.createUser = this.createUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserByEmail = this.getUserByEmail.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getUserByProviderId = this.getUserByProviderId.bind(this);

	  }

    databaseUrl = `http://sqlite-service:3000/databases/${SQLITE_DATABASE_NAME}`;
    fetchJSON = async(url:string, options?:any) =>{
      const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
     // console.log("🔐 response ",await response.json());
    //  if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
      if (!response.ok){
        const details = await response.json();
        console.error("🔐 details ",details);
      // return details;
         throw { satusCode:response.status  ,error: response.statusText ,message: details.message, details };
      }
      return response.json();
    }

  createUser = async (name:string, email:string)=> {

    const tryUser = await this.getUserByEmail(email);
    if (tryUser.length > 0) {
      throw { satusCode:404  ,error: "Not Found" ,message: "User already exists" };
    }


    const users = await this.fetchJSON(`${this.databaseUrl}/table/users/rows`, {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
    console.log("🔐 users ",users);
    return users
  }
  createUserNoCredential = async ()=> {
    const users = await this.fetchJSON(`${this.databaseUrl}/table/users/rows`, {
      method: "POST",
      body: JSON.stringify({ }),
    });
    console.log("🔐 users ",users);
    return users
  }

  getUsers = async (filter = {})=> {
    const query = new URLSearchParams(filter).toString();
    const users = await this.fetchJSON(`${this.databaseUrl}/table/users?${query}`,{method:'GET'});
    return users;
  }

  getUserByEmail = async (email:string)=> {
    const filter = JSON.stringify([{ column: 'email', operator: '=', value: email }]);
   // const user =  await databaseService.getTableData(databaseService.SQLITE_DATABASE_NAME, 'users', JSON.stringify([{ column: 'email', operator: '=', value: email }]));
   const user = await this.fetchJSON(`${this.databaseUrl}/table/users?filters=${filter}`);
    if (user[0] === undefined) {
      throw { satusCode:404  ,error: "Not Found" ,message: "User not found" };
    }
      return user[0];
  }
  getUserById = async (id:number)=> {
    const filter = JSON.stringify([{ column: 'id', operator: '=', value: id }]);
    const user =  await this.fetchJSON(`${this.databaseUrl}/table/users?filters=${filter}`);
     if (user[0] === undefined) {
      throw { satusCode:404  ,error: "Not Found" ,message: "User not found" };
    }
      return user[0];
  }

  //findUnique({ where: { providerId:idAsString ,provider:'google' } })
  //utiliser une jointure pour récupérer les données de l'utilisateur et de l'authentification

  getUserByProviderId = async (providerId:string, provider:string)=> {
    const filter = JSON.stringify([{ column: 'provider_id', operator: '=', value: providerId },{ column: 'provider', operator: '=', value: provider}]);
    const query = new URLSearchParams(filter).toString();
    const users = await this.fetchJSON(`${this.databaseUrl}/table/auth_providers?${query}`,{method:'GET'});
    if (users[0] === undefined) {
      return;
    }
      return users[0];
  }
/*   findUnique = async (filter = {})=> {
    filter = {database:SQLITE_DATABASE_NAME,table1:'users',table2:'auth_providers',table1joinColumn:'id',table2joinColumn:'user_id'};

    const query = new URLSearchParams(filter).toString();
      //?database=userDb&table1=users&table2=auth_providers&table1joinColumn=id&table2joinColumn=user_id`);
    const user = await this.fetchJSON(`${this.databaseUrl}/joinedtable?${query}`,{method:'GET'});
   
  } */
  //findOrCreateUser = async (email:string, name:string)=> {

/*  executeQuery =async (sql, params = [])=> {
    return fetchJSON(`${SQLITE_API_URL}/query`, {
      method: "POST",
      body: JSON.stringify({ sql, params }),
    });
  } */
};
export { UserModel };
/*
//backend-service/routes/userRoutes.ts
import { UserModel } from "../models/UserModel.js";

export default async function (fastify) {
  fastify.get("/users", async (req, reply) => {
    const users = await UserModel.getUsers();
    return reply.send(users);
  });

  fastify.post("/users", async (req, reply) => {
    const { name, email } = req.body;
    const user = await UserModel.createUser(name, email);
    return reply.send(user);
  });
}
  */