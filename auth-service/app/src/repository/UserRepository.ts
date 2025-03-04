/**
 * Repository - Gestion des appels HTTP à la DB
 * role : Communique avec le service DB via HTTP
 *  -- Centralise les requêtes SQL en HTTP et évite que les controllers ou services les gèrent directement.
 * -- Permet de changer facilement de DB sans modifier le code des services.
 */
import Helpers, { IParams } from "../repository/helpers";
import { User } from "../models/User";

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
    return data.map(User.fromJSON);
  }

  static async getUserById(id: number): Promise<User | null> {

	const params: IParams = {
		database: SQLITE_DATABASE_NAME,
		table: TABLE,
		filters: [{ column: "id", operator: "=", value: id }],
	};
	const queryString = Helpers.buildQueryString(params);

	const url = `${this.BASE_URL}/table/${TABLE}?${queryString}`;
    const response = await fetch(url);
	console.log("🔐 UserRepository.getUserById() response ",response);
    const data = await response.json();
	console.log("🔐 UserRepository.getUserById() data ",data[0]);
	//return data[0] as User;
    return data.length ?  User.fromJSON(data[0]) : null;
  }


  static async createUser(userData: Partial<User>): Promise<User> {
    const { authProviders,id, ...userExtracted} = userData;
	  //console.log("fetching ",`${this.BASE_URL}/table/${TABLE}/rows`);
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        database: SQLITE_DATABASE_NAME,
        table: "users",
        data: userExtracted,
      }),
    });
    const data = await response.json();
	  const user = User.fromJSON(data.data);

	  if (!user) {
	    throw new Error("User creation failed");
	  }	
    return user;
  }
  
  static async createVoidUser(): Promise<User> {
	  console.log("fetching ",`${this.BASE_URL}/table/${TABLE}/rows`);
    const response = await fetch(`${this.BASE_URL}/table/${TABLE}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        database: SQLITE_DATABASE_NAME,
        table: "users",
        data: {name:""},
      }),
    });
    const data = await response.json();
	  const user = User.fromJSON(data.data);

	  if (!user) throw new Error("User creation failed");

    return user;
  }
}
