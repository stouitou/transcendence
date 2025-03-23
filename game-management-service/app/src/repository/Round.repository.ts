/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import  { IParams } from "../repository/helpers";
import { Round } from "../models/Round";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";

/**
 * RoundRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class RoundRepository
 * @extends {BaseRepository<Round>}
 * @implements {IRepository<Round>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class RoundRepository extends BaseRepository<Round> implements IRepository<Round>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "round", ["tournaments", "players","games"]);
  }
  //create
  create = async (round: Partial<Round>): Promise<Round> => {
    const {/*  authProviders, */ id, ...roundExtracted } = round;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...roundExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐Round.repository.ts RoundRepository.create()  --data--",data)
    const roundCreated = data.data;
    console.log("🔐Round.repository.ts RoundRepository.create()  --roundCreated--",roundCreated)
   // const roundCreated = User.fromJSON(data.data);
    if (!roundCreated) {
      throw new Error("🔐Round creation failed");
    }
    console.log(" RoundRepository.create()  --roundCreated-- OK")
    return roundCreated;
  };

  private getRelations = (): string => {
    console.log("🔐 RoundRepository.getRelations()  --this.RELATIONS--",this.RELATIONS)
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<Round[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 RoundRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 RoundRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 RoundRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 RoundRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<Round | null> => {
      
    const url = `${this.URL}/id/${id}${this.getRelations()}`;//?relations=players{this.getRelations()}
    console.log("🔐 RoundRepository.getById()  --url--",url)
    const response = await fetch(url);
    const  result  = await response.json();
    console.log("🔐Round.repository.ts RoundRepository.getById()  --data--",result)
   const { data } = result
    return data?? null;
  }


  getByParams = async(params: IParams) : Promise<Round[] | null> => {
  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 RoundRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 RoundRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 RoundRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data:null:null;
    }

  getOneByParams = async(params: any) : Promise<Round | null> => {  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 RoundRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 RoundRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 RoundRepository.getByParams()  --data--",data)
      // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data[0]:null:null;
    }

  //update
  update = async (user: Partial<Round>):Promise<Round>=>{
    console.log("🔐 RoundRepository.update()  --user--",user)
    const { id, ...userExtracted } = user;
    console.log("🔐 RoundRepository.update()  --userExtracted--",userExtracted)
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐 RoundRepository.update()  --data--",data)
    //const userUpdated = User.fromJSON(data.data);
    const userUpdated =data.data;
    if (!userUpdated) {
      throw new Error("User update failed");
    }
    return userUpdated;
  }
  
  //delete
  delete = async (id: number) :Promise<boolean>=>{
    const response = await fetch(`${this.URL}/id/${id}`, {// delete sans body!!! ou avec body non vide si content-type: application/json
      method: "DELETE",     
    });
    const data = await response.json();
    return data;
  }
}
export default RoundRepository;