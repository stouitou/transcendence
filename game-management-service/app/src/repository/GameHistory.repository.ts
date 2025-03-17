/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import  { IParams } from "./helpers";
import { GameHistory } from "../models/GameHistory";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";

/**
 * GameHistoryRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class GameHistoryRepository
 * @extends {BaseRepository<GameHistory>}
 * @implements {IRepository<GameHistory>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class GameHistoryRepository extends BaseRepository<GameHistory> implements IRepository<GameHistory>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "GameHistory", ["game","game.players"]);
  }
  //create
  create = async (game: Partial<GameHistory>): Promise<GameHistory> => {
    const {/*  authProviders, */ id, ...gameExtracted } = game;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...gameExtracted,
      }),
    });
    const data = await response.json();
    console.log("GameHistory.repository.ts GameHistoryRepository.create()  --data--",data)
    const gameCreated = data.data;
    console.log("GameHistory.repository.ts GameHistoryRepository.create()  --gameCreated--",gameCreated)
   // const gameCreated = User.fromJSON(data.data);
    if (!gameCreated) {
      throw new Error("User creation failed");
    }
    console.log(" GameHistoryRepository.create()  --gameCreated-- OK")
    return gameCreated;
  };

  private getRelations = (): string => {
    console.log("🔐 GameHistoryRepository.getRelations()  --this.RELATIONS--",this.RELATIONS)
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<GameHistory[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 GameHistoryRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 GameHistoryRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 GameHistoryRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 GameHistoryRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<GameHistory | null> => {
      
    const url = `${this.URL}/id/${id}${this.getRelations()}`;//{this.getRelations()}
    console.log("🔐 GameHistoryRepository.getById()  --url--",url)
    const response = await fetch(url);
    const  result  = await response.json();
    console.log("GameHistory.repository.ts GameHistoryRepository.getById()  --data--",result)
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
  getByParams = async(params: IParams) : Promise<GameHistory[] | null> => {
  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 GameHistoryRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 GameHistoryRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 GameHistoryRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data:null:null;
    }
    getOneByParams = async(params: any) : Promise<GameHistory | null> => {  
      //  const queryString = Helpers.buildQueryString(params);
        const queryString = this.newfilters(params);
        console.log("🔐 GameHistoryRepository.getByParams()  --queryString--",queryString)
        const url = `${this.URL}${queryString}`;
        const response = await fetch(url);
        console.log("🔐 GameHistoryRepository.getByParams()  --response--",response)
        const data = await response.json();
        console.log("🔐 GameHistoryRepository.getByParams()  --data--",data)
       // return data.map(User.fromJSON);
        return data.data?data.data[0]?data.data[0]:null:null;
      }



  //update
  update = async (user: Partial<GameHistory>):Promise<GameHistory>=>{
    console.log("🔐 GameHistoryRepository.update()  --user--",user)
    const { id, ...userExtracted } = user;
    console.log("🔐 GameHistoryRepository.update()  --userExtracted--",userExtracted)
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐 GameHistoryRepository.update()  --data--",data)
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
export default GameHistoryRepository;