/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import Helpers, { IParams } from "../repository/helpers";
import { User } from "../models/User.models";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";

/**
 * UserRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class UserRepository
 * @extends {BaseRepository<User>}
 * @implements {IRepository<User>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class UserRepository extends BaseRepository<User> implements IRepository<User>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "user", ["authProviders",
      "tournaments",
      "tournaments.rounds",
      "tournaments.rounds.players",
      "tournaments.rounds.games",
      "games","games.gameHistory","games.gameHistory.players",
      "friends"]);
  }
  //create
  create = async (user: Partial<User>): Promise<User> => {
    const {/*  authProviders, */ id, ...userExtracted } = user;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐User.repository.ts UserRepository.create()  --data--",data)
    const userCreated = data.data;
    console.log("🔐User.repository.ts UserRepository.create()  --userCreated--",userCreated)
   // const userCreated = User.fromJSON(data.data);
    if (!userCreated) {
      throw new Error("User creation failed");
    }
    console.log(" UserRepository.create()  --userCreated-- OK")
    return userCreated;
  };

  private getRelations = (): string => {
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<User[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 UserRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 UserRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 UserRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 UserRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<User | null> => {
      
    const url = `${this.URL}/id/${id}${this.getRelations()}`;// on ajoute toutes les relations
    console.log("🔐 UserRepository.getById()  --url--",url)
    const response = await fetch(url);
    const  result  = await response.json();
    console.log("🔐User.repository.ts UserRepository.getById()  --data--",result)
   const { data } = result
    return data?? null;
  }

/*   getByParams = async(params: IParams) : Promise<User[] | null> => {

    const queryString = Helpers.buildQueryString(params);
    const url = `${this.URL}?${queryString}`;
    const response = await fetch(url);
    const data = await response.json();
   // return data.map(User.fromJSON);
    return data.data;
  } */
  getByParams = async(params: IParams) : Promise<User[] | null> => {
  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 UserRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 UserRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 UserRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data:null:null;
    }
    getOneByParams = async(params: any) : Promise<User | null> => {  
      //  const queryString = Helpers.buildQueryString(params);
        const queryString = this.newfilters(params);
        console.log("🔐 UserRepository.getByParams()  --queryString--",queryString)
        const url = `${this.URL}${queryString}`;
        const response = await fetch(url);
        console.log("🔐 UserRepository.getByParams()  --response--",response)
        const data = await response.json();
        console.log("🔐 UserRepository.getByParams()  --data--",data)
       // return data.map(User.fromJSON);
        return data.data?data.data[0]?data.data[0]:null:null;
      }



  //update
  update = async (user: Partial<User>):Promise<User>=>{
    const { id, ...userExtracted } = user;
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    //const userUpdated = User.fromJSON(data.data);
    const userUpdated =data.data;
    if (!userUpdated) {
      throw new Error("User update failed");
    }
    return userUpdated;
  }
  //delete
  delete = async (id: number) :Promise<boolean>=>{
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },     
    });
    const data = await response.json();
    return data;
  }
}
export default UserRepository;