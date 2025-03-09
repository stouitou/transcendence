/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import bcrypt from "bcryptjs";
import Helpers, { IParams } from "../repository/helpers";
import { AuthProvider } from "../models/AuthProvider.models";
import { IRepository } from "./Base/IRepository";
import { BaseRepository } from "./Base/BaseRepository";

/**
 * AuthProviderRepository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 * -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 * @export
 * @class AuthProviderRepository
 * @extends {BaseRepository<AuthProvider>}
 * @implements {IRepository<AuthProvider>}
 * -- getAll() : Récupère tous les utilisateurs
 * -- getById() : Récupère un utilisateur par son id
 * -- getByParams() : Récupère un utilisateur par ses paramètres
 * -- create() : Crée un utilisateur
 * -- update() : Met à jour un utilisateur
 * -- delete() : Supprime un utilisateur
 */
class AuthProviderRepository extends BaseRepository<AuthProvider> implements IRepository<AuthProvider>  {
  //constructor : initialise:
  // - le nom de la DB 
  // - le nom de la table,
  // - les relations (nom des propriétés liées à d'autres tables)
  constructor() {
    super("myDb", "AuthProvider", ["user_id"]);
  }
  //create pas util pour le moment
  create = async (entity: Partial<AuthProvider>): Promise<AuthProvider> => {
    const {/*  authProviders, */ id, ...entityExtracted } = entity;
    const response = await fetch(this.URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entityExtracted,
      }),
    });
    const data = await response.json();
    const entityCreated = data.data;
   // const entityCreated = entity.fromJSON(data.data);
    if (!entityCreated) {
      throw new Error("entity creation failed");
    }
    return entityCreated;
  };

  private getRelations = (): string => {
    if (this.RELATIONS.length === 0) {
      return "";
    }
    return `?relations=${this.RELATIONS.join("&relations=")}`;
  };

  //read
  getAll = async (): Promise<AuthProvider[]> =>{
   
    //return data.map(User.fromJSON);
    const url = `${this.URL}${this.getRelations()}`;
    console.log("🔐 AuthProviderRepository.getAll()  --start-- fetch from: ", this.URL)
    const response = await fetch(url);
    console.log("🔐 AuthProviderRepository.getAll()  --response--",response)
    const data = await response.json();
    console.log("🔐 AuthProviderRepository.getAll()  --data--",data)
    const results = data.data//.map((user: User) => User.fromJSON(user));
    //const results = data.data.map(User.fromJSON);
    console.log("🔐 AuthProviderRepository.getAll()  --results--",results)
    return {...results};
  }

 getById= async (id: number): Promise<AuthProvider | null> => {
      
    const url = `${this.URL}/${id}`;
    const response = await fetch(url);
    const data = await response.json();
   // return data.length ? User.fromJSON(data[0]) : null;
    return data.length ? data[0] : null;
  }

/*   private newfilters = (params:any): string => {
    //const params = { id: 1, name: "test" };
    //const queryString = '?filters={"id":1,"name":"test"}';
    //const queryString = %7B%22id%22%3A1%2C%22name%22%3A%22test%22%7D encoded
      if (!params) {
        return "";
      }    
      const encodeFilter = (filter: any) => `filters=${encodeURIComponent(JSON.stringify(filter))}`;
      if (Array.isArray(params)) {
        return params.map(encodeFilter).join("&");
      }
    
      return `?${encodeFilter(params)}`;
    }; */
  getByParams = async(params: IParams) : Promise<AuthProvider[] | null> => {

  //  const queryString = Helpers.buildQueryString(params);
    const queryString = this.newfilters(params);
    console.log("🔐 AuthProviderRepository.getByParams()  --queryString--",queryString)
    const url = `${this.URL}${queryString}`;
    const response = await fetch(url);
    console.log("🔐 AuthProviderRepository.getByParams()  --response--",response)
    const data = await response.json();
    console.log("🔐 AuthProviderRepository.getByParams()  --data--",data)
   // return data.map(User.fromJSON);
    return data.data?data.data[0]?data.data:null:null;
  }
  
  getOneByParams = async(params: IParams) : Promise<AuthProvider | null> => {

    //  const queryString = Helpers.buildQueryString(params);
      const queryString = this.newfilters(params);
      console.log("🔐 AuthProviderRepository.getByParams()  --queryString--",queryString)
      const url = `${this.URL}${queryString}`;
      const response = await fetch(url);
      console.log("🔐 AuthProviderRepository.getByParams()  --response--",response)
      const data = await response.json();
      console.log("🔐 AuthProviderRepository.getByParams()  --data--",data)
     // return data.map(User.fromJSON);
      return data.data?data.data[0]?data.data[0]:null:null;
    }


  //update
  update = async (user: Partial<AuthProvider>):Promise<AuthProvider>=>{
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

  isValidPassword = async (password:string,hash:string): Promise<boolean> =>{

    return bcrypt.compare(password, hash);
    }
}
export default AuthProviderRepository;