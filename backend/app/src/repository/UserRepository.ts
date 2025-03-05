/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import Helpers, { IFilter, IParams } from "../repository/helpers";
import { User, UserBody, UserCreate } from "../models/User";

const SQLITE_DATABASE_NAME = "usersDB";
const TABLE = "users";

/**
 * Repository - Gestion des appels HTTP à la DB
 * --
 * @export
 * @class UserRepository
 *  -- getAll() : Récupère tous les utilisateurs
 *  -- getById() : Récupère un utilisateur par son id
 *  -- create() : Crée un utilisateur
 *  
 */

export class UserRepository {
  
  private static BASE_URL =  `http://sqlite-service:3000/databases/${SQLITE_DATABASE_NAME}`;

  static async getAll(): Promise<User[]> {
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}`);
    const data = await response.json();
    const users = data.map(User.fromJSON);
    const result = users.map((user:User) => {
     // return {...user.toJSON()};
      //return {...user.toFilteredJSON({name:true,email:true})};
      return {...user.toJson(UserBody)};
    });
    return result;
  }

  static async getById(id: number): Promise<Partial<User> | null> {
    //1- Construire les paramètres de la requête
  	const params: IParams = {
	    database: SQLITE_DATABASE_NAME,
  	  table: TABLE,
	    filters: [{ column: "id", operator: "=", value: id }],
    };
    //2- Construire l'URL de la requête
	  const queryString = Helpers.buildQueryString(params);
	  const url = `${this.BASE_URL}/table/${TABLE}?${queryString}`;
    //3- Exécuter la requête
    const response = await fetch(url);
    //4- Traiter la réponse
    const data = await response.json();
    //5- Récupérer le premier utilisateur
    const user = data.length ?  User.fromJSON(data[0]) : null;
    //6- Retourner l'utilisateur fitlter en fonction des clés à garder ou null
    return user?{...user?.toJson(UserBody)}:null;
   /*  const userkeyFilter = createFilter( {id:0,email:"",name:""});
    console.log("🔐 UserRepository.getUserById().toJson user ",test);
    return user?{...user?.toFilteredJSON(userkeyFilter)}:null;
 */
  }


  static async create(userData: Partial<User>): Promise<User> {
 //   const { authProviders,id, ...userExtracted} = userData;
   const newUser = new User(userData);
	  //console.log("fetching ",`${this.BASE_URL}/table/${TABLE}/rows`);
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        database: SQLITE_DATABASE_NAME,
        table: "users",
       // data: userExtracted,
        data: newUser.toJson(UserCreate),
      }),
    });
    const data = await response.json();
    console.log("🔐 UserRepository.create() data ",data);
	  //const user = User.fromJSON(data.data);
  //  const user = new User({...data.data,email:userData.email});
    const user = new User(data.data);
   // const user = new User(data.data);
    const userResponse = user.toJson(UserBody);
    console.log("🔐 UserRepository.create() user ",user);
    console.log("🔐 UserRepository.create() userResponse ",userResponse);

	  if (!user) {
	    throw new Error("User creation failed");
	  }	
    return userResponse as User;
  }

  static async update(id: number, userData: Partial<User>): Promise<User> {
    userData.updated_at = new Date();
   // const { authProviders, ...userExtracted} = userData;
   // const updated_at = {updated_at:new Date()};
   // userExtracted.updated_at = updated_at.updated_at;
    const url = `${this.BASE_URL}/table/${TABLE}/id/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({...userData}),
    });
    const data = await response.json();
    console.log("🔐 UserRepository.update() data ",data);
	  const user = User.fromJSON(data.data);
	  if (!user) {
	    throw new Error("User creation failed");
	  }	

    return user?{...user.toFilteredJSON({name:true})}:null;
  }


  //DELETE  /databases/:database/table/:table/deleterow/:id
  static async delete(id: number): Promise<void> {
    const url = `${this.BASE_URL}/table/${TABLE}/deleterow/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("User deletion failed");
    }
    return await response.json();
    return response.json();
  } 

    //DELETE  /databases/:database/table/:table/deleterows
    static async deletes(filters:IFilter[]): Promise<void> {
      const params: IParams = {
        database: SQLITE_DATABASE_NAME,
        table: TABLE,
        filters: filters,
      };
      const queryString = Helpers.buildQueryString(params);
      const url = `${this.BASE_URL}/table/${TABLE}/deleterows?${queryString}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("User deletion failed");
      }
      return response.json();
    }  


  static async queryRaw(sql:string,value:string[]): Promise<any> {
    const url = `${this.BASE_URL}/table/${TABLE}/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({sql:sql,values:value}),
    });
    const data = await response.json();
    console.log("🔐 UserRepository.queryRaw() data ",data);
    return {...data.data};
  }
}
