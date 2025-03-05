/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import Helpers, { IParams } from "../repository/helpers";
//import { User } from "../models/User";
import { AuthProvider } from "../models/authProvider";
import { UserRepository } from "./UserRepository";
const SQLITE_DATABASE_NAME = "usersDB";
const TABLE = "auth_providers";

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
export class AuthRepository {
	
  private static BASE_URL =  `http://sqlite-service:3000/databases/${SQLITE_DATABASE_NAME}`;

  static async getAll(): Promise<AuthProvider[]> {
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}`);
    const data = await response.json();
    return data.map(AuthProvider.fromJSON);
  }

  static async getAutProviderByEmail(email: string): Promise<AuthProvider | null> {
    const params: IParams = {
      database: SQLITE_DATABASE_NAME,
      table: TABLE,
      filters: [{ column: "provider_id", operator: "=", value: email }, { column: "provider", operator: "=", value: "local" }],
    };

	const queryString = Helpers.buildQueryString(params);
	const url = `${this.BASE_URL}/table/${TABLE}?${queryString}`;
    const response = await fetch(url);
    console.log("🔐 AuthRepository.getAutProviderByEmail() response ",response);
    const data = await response.json();
    console.log("🔐 AuthRepository.getAutProviderByEmail() data ",data);
    return data.length ? AuthProvider.fromJSON(data[0]) : null;
  }

  static async getAutProviderById(id: number): Promise<AuthProvider | null> {
    const params: IParams = {
		  database: SQLITE_DATABASE_NAME,
		  table: TABLE,
		  filters: [{ column: "id", operator: "=", value: id }],
	  };
	  const queryString = Helpers.buildQueryString(params);

	  const url = `${this.BASE_URL}/table/${TABLE}?${queryString}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.length ? AuthProvider.fromJSON(data[0]) : null;
  }


  //getAutProviderByProviderId se charge de récupérer un utilisateur par son provider_id 
  // et son provider (google, facebook, local)
  static async getAutProviderByProviderId(provider_id: string,provider:string): Promise<AuthProvider | null> {

    const params: IParams = {
      database: SQLITE_DATABASE_NAME,
      table: TABLE,
      filters: [{ column: "provider_id", operator: "=", value: provider_id }, { column: "provider", operator: "=", value: provider }],
    };

	const queryString = Helpers.buildQueryString(params);
	const url = `${this.BASE_URL}/table/${TABLE}?${queryString}`;
    const response = await fetch(url);
    const data = await response.json();
//on dois retourner un seul User
    if (data.length) {
      //on recherche le premier User qui correspond a l id 
     return await UserRepository.getUserById(data[0].user_id) as unknown as AuthProvider; //@TODO CEST TRES MOCHE §§§§§§


     // return AuthProvider.fromJSON(data[0]);
    }
    return null;
    }

  static async createAuthProvider(authProviderData: Partial<AuthProvider>): Promise<AuthProvider> {
    const {id, ...extractedData} = authProviderData;
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        database: SQLITE_DATABASE_NAME,
        table: TABLE,
        data: extractedData,
      }),
    });
    const data = await response.json();
	  const authProvider = AuthProvider.fromJSON(data.data);
    return authProvider;
  }
}
