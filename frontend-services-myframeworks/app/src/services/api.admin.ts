import { Game,User } from "../types/types";
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
export type MetaPaginationUsers = { limit: number, offset: number, order: 'ASC'|'DESC',total: number }

export type ApiRedirectResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: MetaPaginationUsers;
};
//requete redirigée ce sont les donnees de la base de données rediriger par user-management-service
//Object { success: true, statusCode: 200, message: "OK", data: (1) […], meta: {…} }
export const getUsers = async (pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<User>|void> => {
  const { limit = 10, offset = 0, order = 'ASC' } = pagination;
  //const { type = "remote" } = filter;
//&filters={"type":"${type}","format":"classic"}&relations=players
  const url = `/api/users/admin/users?limit=${limit}
				&offset=${offset}
				&order=${order}`
	return	apiRequest<Promise<ApiRedirectResponse<User> | void>>(url,'GET');
}

/* export const getTournaments = async (pagination:Pagination,filter:Filter): Promise<ApiRedirectResponse<Tournaments>|void> => {
	const { limit = 10, offset = 0, order = 'ASC' } = pagination;
	const { type = "remote" } = filter;

	const url = `/api/users/me/tournaments?limit=${limit}&offset=${offset}&order=${order}&filters={"type":"${type}"}`

	return	apiRequest<Promise<ApiRedirectResponse<Tournaments> | void>>(url,'GET');
} */


/**
 * Admin Users Edit
 */

export const editUser = async (id: number, user: Partial<User>): Promise<User | void> => {
  const url = `/api/users/admin/users/${id}`;
  return apiRequest<User | void>(url, 'PUT', user);
}

/**
 * Admin Users Delete
 */
export const deleteUser = async (id: number): Promise<User | void> => {
  const url = `/api/users/admin/users/${id}`;
  return apiRequest<User | void>(url, 'DELETE', {});
}
/**
 * Admin Users disable 2FA
 */

export const disable2FA = async (id: number): Promise<User | void> => {
  const url = `/api/users/admin/users/${id}/2fa/disable`;
  return apiRequest<User | void>(url, 'PUT', {});
}

/**
 * Admin Users status 2FA
 */
export const get2FAStatus = async (id: number): Promise<{ provider: string, provider_id: string, two_factor_auth: boolean, two_factor_auth_method: "email"|"totp" } | void> => {
  const url = `/api/users/admin/users/${id}/2fa/status`;
  return apiRequest<{ provider: string, provider_id: string, two_factor_auth: boolean, two_factor_auth_method: "email"|"totp" } | void>(url, 'GET');
}

/**
 * Admin Users update Avatar
 */
export const uploadAvatar = async (id:number,formData: FormData): Promise<User | void> => {
	  const url = `/api/users/admin/users/${id}/upload-avatar`;
	  return apiRequest<User | void>(url, 'POST', formData,{},true,false);
}