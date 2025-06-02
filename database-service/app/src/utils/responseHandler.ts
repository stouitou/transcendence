import { FastifyReply } from "fastify";
import {handleDatabaseErrors} from "./errorHandler";
/**
 * reponse Format standardisé pour toutes les réponses réussies
 */
type SuccessResponse<T> = {
	success: true;
	statusCode: number;
	message: string;
	data: T;
	meta?: {
	  total?: number;
	  limit?: number;
	  offset?: number;
	  order?: "ASC" | "DESC";
	  relations?: string[];
	};
  };
  
  /**
   * reponse Format standardisé pour toutes les réponses d'erreur
   */
  type ErrorResponse = {
	success: false;
	statusCode: number;
	error: string;
	message: string;
	details?: any;
  };
  
  
  /**
   * reponse Format standardisé pour toutes les réponses
   */
  export type Response<T> = SuccessResponse<T> | ErrorResponse;  //👈 Union type
  function getStatusMessage(statusCode: number): {statusCode: number, message: string} {
	switch (statusCode) {
	  case 200:
		return {statusCode: 200, message: "OK"};
	  case 201:
		return {statusCode: 201, message: "Created"};
	  case 204:
		return {statusCode: 204, message: "No Content"};
	  case 400:
		return {statusCode: 400, message: "Bad Request"};
	  case 401:
		return {statusCode: 401, message: "Unauthorized"};
	  case 403:
		return {statusCode: 403, message: "Forbidden"};
	  case 404:
		return {statusCode: 404, message: "Not Found"};
	  case 500:
		return {statusCode: 500, message: "Internal Server Error"};
	  default:
		return {statusCode: 500, message: "Internal Server Error"};
	}
  }
  
  
  //function generateSucessResponse<T>( reply: FastifyReply, code:number, data: T, options?: { limit?: number; offset?: number; order?: "ASC" | "DESC",relations?:string[],total?:number }): Response<T> {
export function generateSucessResponse<T>( reply: FastifyReply, code:number, data: T, options?: { limit?: number; offset?: number; order?: "ASC" | "DESC",relations?:string[],total?:number }) {
   if (!options) {
	 options = { limit: 0, offset: 0, order: "ASC" };
   }
//   console.log("🔗 responseHandler.ts generateSucessResponse()  --total:",options.total)
   options = {
	  limit: options.limit ? options.limit : 0,
	  offset: options.offset ? options.offset : 0,
	  order: options.order ? options.order : "ASC",
	  relations: options.relations ? options.relations : [],
	  total: options.total? options.total: Object.keys(data as any).length,
	}; 
	const {statusCode,message} = getStatusMessage(code);
	
	return reply.status(code).send({
	  success: true,
	  statusCode,
	  message: message,
	  data,
	  meta: options,
	});
  }
  
export function generateErrorResponse(reply: FastifyReply, error: any) {
	//const {statusCode} = getStatusMessage(code);
	const {status,...err} = handleDatabaseErrors(error);
	return reply.status(status).send( {
	  success: false,
	  statusCode: status,
      ...err
	});
  }
  
  
