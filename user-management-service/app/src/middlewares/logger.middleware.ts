import { ErrorResponse } from '@src/Errors/handler';
import { FastifyRequest, FastifyReply } from 'fastify';


export const loggerMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log(`[${new Date().toLocaleString()}] ${request.method} ${request.url}`);
};

export const errorsLog = (error: ErrorResponse) => {
  console.log(`[${new Date(error.timestamp).toLocaleString()}] 🔴 [generateErrorResponse:] [${error.status}] [${error.type}] "${error.message}" ${error.field ? `Field: ${error.field}` : ""} ${error.code ? `Code: ${error.code}` : ""} ${error.details ? `Details: ${JSON.stringify(error.details)}` : ""}`);
}

export const errorDebugLog = (type: string, methodeName:string, message:string, data?:any) => {
  console.log(`[DEBUG][${type}][${methodeName}] ${message} ${data ? JSON.stringify(data) : ""}`);
}
//export default loggerMiddleware;

