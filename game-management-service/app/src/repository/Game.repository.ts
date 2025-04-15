/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import  { IParams } from "../repository/helpers";
import { Game } from "../models/Game";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";
import { User } from "@src/models/User";
import { Players } from "@src/models/GameHistory";

/**
 * GameRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class GameRepository
 * @extends {BaseRepository<Game>}
 * @implements {IRepository<Game>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class GameRepository extends BaseRepository<Game> implements IRepository<Game>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "game", ["tournaments", "players", "gameHistory"]);
  }
  //create
  create = async (game: Partial<Game>): Promise<Game> => {
    const {/*  authProviders, */ id, ...gameExtracted } = game;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...gameExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐Gane.repository.ts GameRepository.create()  --data--",data)
    const gameCreated = data.data;
    console.log("🔐Gane.repository.ts GameRepository.create()  --gameCreated--",gameCreated)
   // const gameCreated = User.fromJSON(data.data);
    if (!gameCreated) {
      throw new Error("User creation failed");
    }
    console.log(" GameRepository.create()  --gameCreated-- OK")
    return gameCreated;
  };

  private getRelations = (): string => {
    console.log("🔐 GameRepository.getRelations()  --this.RELATIONS--",this.RELATIONS)
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<Game[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 GameRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 GameRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 GameRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 GameRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<Game | null> => {
      
    const url = `${this.URL}/id/${id}?relations=players`;//{this.getRelations()}
    console.log("🔐 GameRepository.getById()  --url--",url)
    const response = await fetch(url);
    const  result  = await response.json();
    console.log("🔐Gane.repository.ts GameRepository.getById()  --data--",result)
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
  getByParams = async(params: IParams) : Promise<Game[] | null> => {
  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 GameRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 GameRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 GameRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data:null:null;
    }
    getOneByParams = async(params: any) : Promise<Game | null> => {  
      //  const queryString = Helpers.buildQueryString(params);
        const queryString = this.newfilters(params);
        console.log("🔐 GameRepository.getByParams()  --queryString--",queryString)
        const url = `${this.URL}${queryString}`;
        const response = await fetch(url);
        console.log("🔐 GameRepository.getByParams()  --response--",response)
        const data = await response.json();
        console.log("🔐 GameRepository.getByParams()  --data--",data)
       // return data.map(User.fromJSON);
        return data.data?data.data[0]?data.data[0]:null:null;
      }



  //update
  update = async (user: Partial<Game>):Promise<Game>=>{
    console.log("🔐 GameRepository.update()  --user--",user)
    const { id, ...userExtracted } = user;
    console.log("🔐 GameRepository.update()  --userExtracted--",userExtracted)
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐 GameRepository.update()  --data--",data)
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

  addPlayer = async (gameId: number, playerId: number): Promise<Game | null> => {
      //1- recuperer le game
      const game = await this.getById(gameId);
      if (!game) {
        return null;
      }
      console.log("🔐 GameRepository.addPlayer()  --game--",game)
      //2- recuperer les joueurs et en faire un tableau d'int avec les id des joueurs
      const { players } = game;
      const playersIds = players?(players as User[]).map((player: User) => player.id):[];
      //3- verifier si le joueur est deja dans le game
      if (playersIds.includes(playerId)) {
        return game;
      }
      //4- ajouter le joueur
      playersIds.push(playerId);
      //5- mettre à jour le game
  
      const newPlayersHistory = {
      type: "remote",
      avatar: "",
      display_name: "coucou",
      score: 0,
      user: playerId
    }
    
    const gameHistoryPlayersIds = game.gameHistory?.players?(game.gameHistory.players as Players[]).map((player: Players) => {return{id:player.id}}):[];

    const response = await fetch(`${this.URL}/id/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: playersIds,          
          gameHistory: {...game.gameHistory,players:[...gameHistoryPlayersIds,newPlayersHistory]},
        })
      });
      const data = await response.json();
      return data.data;
    }
  
}
export default GameRepository;