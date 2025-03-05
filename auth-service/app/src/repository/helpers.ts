import bcrypt from "bcryptjs";

export interface IFilter {
	column: string;
	operator: string;
	value: string | number | boolean;
  }
  
export  interface IParams {
	database?: string;
	table?: string;
	limit?: number;
	offset?: number;
	filters?: IFilter[];
	[key: string]: string | number | IFilter[] | undefined; // permet de définir des propriétés dynamiques
  }

class Helpers {
  static hashPassword(password: string) {
	return bcrypt.hashSync(password, 10);
  }

  static comparePasswords(password: string, hash: string) {
	return bcrypt.compareSync(password, hash);
  }


  /**
   * 
   * @param filter 
   * @returns 
   * exemple de filtre : { column: 'email', operator: '=', value: email }
   * exemple de filtre : [{ column: 'email', operator: '=', value: email },{ column: 'name', operator: '=', value: name }]
   */
  static buildFilters = (filter: any) => {
	return JSON.stringify(filter);
  }


  /**
   * 
   * @param params 
   * @returns 
   * exemple de params : 
   * const params = {
		database: "testgenerated01",
		table: "users",
		limit: 200,
		filters: [{ column: "name", operator: "=", value: "Nizar" }]
		};

		const queryString = buildQueryString(params);
		const url = `http://sqlite-service:3000/databases/users/table?${queryString}`;

  		//Résultat : http://sqlite-service:3000/databases/users/table?database=testgenerated01&table=users&limit=200&filters=%5B%7B%22column%22%3A%22name%22%2C%22operator%22%3A%22%3D%22%2C%22value%22%3A%22Nizar%22%7D%5D
   */

  static buildQueryString(params: IParams): string {
	const searchParams = new URLSearchParams();
  
	for (const key in params) {
	  if (params[key] !== undefined && params[key] !== null) {
		if (key === "filters" && Array.isArray(params[key])) {
		  // Encoder les filtres complexes en JSON
		  searchParams.append(key, encodeURIComponent(JSON.stringify(params[key])));
		} else {
		  searchParams.append(key, String(params[key]));
		}
	  }
	}
  	return searchParams.toString();
  }
}

export default Helpers;