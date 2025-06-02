import { FastifyReply } from "fastify";

export class AppError extends Error {
	public code: string;
	public field?: string;
	public status: number;

	constructor(message: string, status = 500, code = "APP_ERROR", name = "AppError", field?: string) {
		super(message);
		this.name = name;
		this.status = status;
		this.code = code;
		this.field = field;
		Error.captureStackTrace(this, this.constructor);
	}
}
export class CustomValidationError extends AppError {
	constructor(message: string, field: string) {
		super(message, 400, "ERROR_VALIDATION", "ValidationError", field);
	}
}
export class CustomCSRFError extends AppError {
  constructor(message: string, code: "ERROR_CSRF_INVALID" | "ERROR_CSRF_EXPIRED") {
    super(message, 403, code, '_csrf');
  }
}
export class AuthError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401, "ERROR_AUTH", "AuthError");
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Ressource non trouvée") {
		super(message, 404, "ERROR_NOT_FOUND", "NotFoundError");
	}
}
/* export class CustomValidationError extends Error {
	public code: string;
	public field: string;
	constructor(message: string, field: string) {
		super(message);
		this.name = "ValidationError";
		this.message = message;
		this.field = field;
		this.code = "ERROR_VALIDATION";
	}
} */
/* export class CustomCSRFError extends Error {
	public code: string;
	public field: string;
	constructor(message: string, field: string, code: string = "ERROR_CSRF_INVALID") {
		super(message);
		this.name = "CsrfError";
		this.message = message;
		this.field = field;
		this.code = code;
	}
} */

export function handleErrors(error: any) {
	const timestamp = new Date().toISOString();
/* 	if (error instanceof CustomValidationError) {
		return {
			status: 400,
			type: error.name,
			message: error.message,
			field: error.field,
			code: error.code,
			timestamp,
		}
	} */
	if (error instanceof AppError) {
		return {
			status: error.status,
			type: error.name,
			message: error.message,
			field: error.field,
			code: error.code,
			timestamp,
		};
	}
	if (error.validation) {
		// Erreur de validation Fastify
		//console.error('Erreur de validation HandleErrors:', error.validation);
		const field = error.validation[0]?.instancePath?.replace(/^\//, '');
		return {
			status: 400,
			type: "ValidationError",
			message: error.validation[0]?.message || error.message,
			field/* : field */,
			code: "ERROR_VALIDATION",
			timestamp,
		}
	}
/* 	  // Erreur CSRF
	if (error instanceof CustomCSRFError) {
		return {
			status: 403,
			type: error.name,
			message: error.message,
			field: error.field,
			code: error.code,
			timestamp,
		}
	} */
	  // Erreur de JsonWebTokenError
	if (error instanceof Error && error.name === "JsonWebTokenError") {
		return {
			status: 401,
			type: "JsonWebTokenError",
			message: error.message,
			code: "ERROR_JWT_INVALID",
			timestamp,
		}
	}

	  // Autres erreurs génériques
	  // ❌ Erreur inconnue instance de Error
	  console.error(' ❌  Erreur inconnue HandleErrors:', error);
	  return {
	    status: error.code || 500,
	    type: error.name || "UnknownError",
	    message: error.message || "Une erreur inconnue s'est produite.",
		code: error.code || "UNKNOWN_ERROR",
		timestamp,
	  }; 
  }  
 
export function generateErrorResponse(reply: FastifyReply, error: any) {
	const {status,type,...err} = handleErrors(error);
	console.log("🔴 generateErrorResponse() - status:",status,"type:",type,"err:",err);
	return reply.status(status).send( {
	  success: false,
	  statusCode: status,
	  error: type,
      ...err
	});
  }