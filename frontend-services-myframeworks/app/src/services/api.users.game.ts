import { Game } from "../types/types";
import { Tournaments } from "../types/types";
import { apiRequest } from "../frameworks/apiRequest";
/**
 * getGames function to fetch the list of games from the server.
 * It uses the Fetch API to make a GET request to the specified endpoint.
 * If the request is successful, it returns the list of games as a JSON object.
 * If the request fails, it logs an error message to the console.
 * @returns {Promise<void>}
 * 
 */
type Pagination = {
	limit?: number;
	offset?: number;
	order?: 'ASC' | 'DESC';
}
type Filter = {
	type?: string;
}
export type MetaPagination = { limit: number, offset: number, order: 'ASC'|'DESC',total: number }

export type ApiRedirectResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: MetaPagination;
};
//requete redirigée
//Object { success: true, statusCode: 200, message: "OK", data: (1) […], meta: {…} }
export const getGames = async (pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<Game>|void> => {
  const { limit = 10, offset = 0, order = 'ASC' } = pagination;
  const { type = "remote" } = filter;

  const url = `/api/users/me/games?limit=${limit}
				&offset=${offset}
				&order=${order}
				&filters={"type":"${type}","format":"classic"}&relations=players`

	return	apiRequest<Promise<ApiRedirectResponse<Game> | void>>(url,'GET');
}

export const getGamesByUserId = async (id:number,pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<Game>|void> => {
  const { limit = 10, offset = 0, order = 'ASC' } = pagination;
  const { type = "remote" } = filter;

  const url = `/api/users/me/games/${id}?limit=${limit}
				&offset=${offset}
				&order=${order}
				&filters={"type":"${type}","format":"classic"}&relations=players`

	return	apiRequest<Promise<ApiRedirectResponse<Game> | void>>(url,'GET');
}
/* export interface Round {
	id: number;
	games: Game[];
	state: string;
	players?: User[] | number[];
	created_at: Date;
	updated_at: Date;
	tournaments?: Partial<Tournaments>[];
	current: number;
} */

//Tournament 


export const getTournaments = async (pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<Tournaments>|void> => {
	const { limit = 10, offset = 0, order = 'ASC' } = pagination;
	const { type = "remote" } = filter;

	const url = `/api/users/me/tournaments?limit=${limit}&offset=${offset}&order=${order}&filters={"type":"${type}"}`

	return	apiRequest<Promise<ApiRedirectResponse<Tournaments> | void>>(url,'GET');
}


export const getTournamentsByUserId = async (id:number,pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<Tournaments>|void> => {
	const { limit = 10, offset = 0, order = 'ASC' } = pagination;
	const { type = "remote" } = filter;

	const url = `/api/users/me/tournaments/${id}?limit=${limit}&offset=${offset}&order=${order}&filters={"type":"${type}"}`

	return	apiRequest<Promise<ApiRedirectResponse<Tournaments> | void>>(url,'GET');
}