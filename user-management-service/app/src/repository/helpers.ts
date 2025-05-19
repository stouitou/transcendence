//import bcrypt from "bcryptjs";

/* export interface IFilter {
	column: string;
	operator: string;
	value: string | number | boolean;
  } */
  
export  interface IParams {
//	database?: string;
//	table?: string;
	limit?: number;
	offset?: number;
	order?: "DESC" | "ASC";
	filters?: any[];
	[key: string]: string | number | any[] | undefined; // permet de définir des propriétés dynamiques
  }

class Helpers {
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

  static buildQueryString<T extends Record<string, any>>(
	params: IParams,
    additionalFilters?: Partial<T>
	): string {
	const searchParams = new URLSearchParams();
/*   
	for (const key in params) {
	  if (params[key] !== undefined && params[key] !== null) {
		if (key === "filters" && Array.isArray(params[key])) {
		  // Encoder les filtres complexes en JSON
		  searchParams.append(key, encodeURIComponent(JSON.stringify(params[key])));
		} else {
		  searchParams.append(key, String(params[key]));
		}
	  }
	} */
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      if (key === "filters") {
        let filters: Record<string, any> = {};

        // Si les filtres sont une chaîne JSON, les parser
        if (typeof params[key] === "string") {
          try {
            filters = JSON.parse(params[key] as string);
          } catch (error) {
            console.error("Invalid filters JSON:", error);
            throw new Error("Invalid filters format");
          }
        } else if (typeof params[key] === "object") {
          filters = params[key];
        }

        // Ajouter les filtres supplémentaires
          if (additionalFilters) {
            filters = { ...filters, ...additionalFilters };
          }

        // Reconstruire les filtres en JSON
        searchParams.append(key, JSON.stringify(filters));
      } else {
        // Ajouter les autres paramètres directement
        searchParams.append(key, String(params[key]));
      }
    }
  }
  	return searchParams.toString();
  }
}

export default Helpers;