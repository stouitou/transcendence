/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import  { IParams } from "./helpers";
import { Tournaments } from "../models/Tournaments";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";
import { User } from "@src/models/User";

/**
 * TournamentsRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class TournamentsRepository
 * @extends {BaseRepository<Tournaments>}
 * @implements {IRepository<Tournaments>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class TournamentsRepository extends BaseRepository<Tournaments> implements IRepository<Tournaments>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "tournaments", ["games", "players"]);
  }
  //create
  create = async (game: Partial<Tournaments>): Promise<Tournaments> => {
    const {/*  authProviders, */ id, ...gameExtracted } = game;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...gameExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐Gane.repository.ts TournamentsRepository.create()  --data--",data)
    const gameCreated = data.data;
    console.log("🔐Gane.repository.ts TournamentsRepository.create()  --gameCreated--",gameCreated)
   // const gameCreated = User.fromJSON(data.data);
    if (!gameCreated) {
      throw new Error("User creation failed");
    }
    console.log(" TournamentsRepository.create()  --gameCreated-- OK")
    return gameCreated;
  };

  private getRelations = (): string => {
    console.log("🔐 TournamentsRepository.getRelations()  --this.RELATIONS--",this.RELATIONS)
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<Tournaments[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 TournamentsRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 TournamentsRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 TournamentsRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 TournamentsRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<Tournaments | null> => {
      
    const url = `${this.URL}/id/${id}?relations=players&relations=games`;//{this.getRelations()}
    console.log("🔐 TournamentsRepository.getById()  --url--",url)
    const response = await fetch(url);
    const  result  = await response.json();
    console.log("🔐Gane.repository.ts TournamentsRepository.getById()  --data--",result)
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
  getByParams = async(params: IParams) : Promise<Tournaments[] | null> => {
  
    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 TournamentsRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 TournamentsRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 TournamentsRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data:null:null;
    }
    getOneByParams = async(params: any) : Promise<Tournaments | null> => {  
      //  const queryString = Helpers.buildQueryString(params);
        const queryString = this.newfilters(params);
        console.log("🔐 TournamentsRepository.getByParams()  --queryString--",queryString)
        const url = `${this.URL}${queryString}`;
        const response = await fetch(url);
        console.log("🔐 TournamentsRepository.getByParams()  --response--",response)
        const data = await response.json();
        console.log("🔐 TournamentsRepository.getByParams()  --data--",data)
       // return data.map(User.fromJSON);
        return data.data?data.data[0]?data.data[0]:null:null;
      }



  //update
  update = async (user: Partial<Tournaments>):Promise<Tournaments>=>{
    console.log("🔐 TournamentsRepository.update()  --user--",user)
    const { id, ...userExtracted } = user;
    console.log("🔐 TournamentsRepository.update()  --userExtracted--",userExtracted)
    const response = await fetch(`${this.URL}/id/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userExtracted,
      }),
    });
    const data = await response.json();
    console.log("🔐 TournamentsRepository.update()  --data--",data)
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

  addPlayer = async (gameId: number, playerId: number): Promise<Tournaments | null> => {
    //1- recuperer le tournoi
    const tournament = await this.getById(gameId);
    if (!tournament) {
      return null;
    }
    console.log("🔐 TournamentsRepository.addPlayer()  --tournament--",tournament)
    //2- recuperer les joueurs et en faire un tableau d'int avec les id des joueurs
    const { players } = tournament;
    const playersIds = players?players.map((player: User) => player.id):[];
    //3- verifier si le joueur est deja dans le tournoi
    if (playersIds.includes(playerId)) {
      return tournament;
    }
    //4- ajouter le joueur
    playersIds.push(playerId);
    //5- mettre à jour le tournoi

    const response = await fetch(`${this.URL}/id/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        players: playersIds,
      }),
    });
    const data = await response.json();
    return data.data;
  }
  newfilters = (params: IParams) => {
    let queryString = "?";
    for (const key in params) {
      if (params[key] !== null) {
        queryString += `${key}=${params[key]}&`;
      }
    }
    return queryString;
  }
}
export default TournamentsRepository;