import { FastifyReply } from "fastify";
import { AppError } from "./errors";
import { errorsLog } from "../middlewares/logger.middleware";

export interface ErrorResponse {
	status: number;
	type: string;
	name: string;
	message: string;
	field?: string;
	code?: string;
	timestamp: string;
	details?: any;
}
export function handleErrors(error: any) {
	const timestamp = new Date().toISOString();

	// App errors (custom)
	if (error instanceof AppError) {
		return {
			status: error.status,
			type: error.name,
			name: error.name,
			message: error.message,
			field: error.field,
			code: error.code,
			timestamp : error.timestamp || timestamp,
		};
	}

	// Fastify validation errors
	if (error.validation) {
		const field = error.validation[0]?.instancePath?.replace(/^\//, "");
		// console.error('Erreur de validation HandleErrors:', error);
		return {
			status: 400,
			type: "ValidationError",
			name: "ValidationError",
			message: error.validation[0]?.message || error.message,
			field,
			code: "ERROR_VALIDATION",
			timestamp,
		};
	}

	// JWT errors
	if (error.name === "JsonWebTokenError") {
		return {
			status: 401,
			type: "JsonWebTokenError",
			name: "JsonWebTokenError",
			message: error.message,
			code: "ERROR_JWT_INVALID",
			timestamp,
		};
	}

	// Unknown/unexpected error
	console.error("❌ Erreur inconnue :", error);

	return {
		status: error.status || 500,
		type: error.name || "UnknownError",
		name: error.name || "UnknownError",
		message: error.message || "Une erreur inconnue s'est produite.",
		code: error.code || "UNKNOWN_ERROR",
		timestamp,
	};
}

export function generateErrorResponse(reply: FastifyReply, error: any) {
	//console.error("🔴 generateErrorResponse:", error);
	const errorHandle = handleErrors(error);
	errorsLog(errorHandle)
	const { status, type, name, ...err } = errorHandle;
	// [<timestamp>][<status>][<type>] <message>
	//console.log("🔴 generateErrorResponse:", status, type, err);
	//console.log(`🔴 [generateErrorResponse:] ${err.timestamp.toLocaleString()} [${status}] [${type}] "${err.message}" ${err.field ? `Field: ${err.field}` : ""} ${err.code ? `Code: ${err.code}` : ""}`);


	return reply.status(status).send({
		success: false,
		statusCode: status,
		name: name,
		error: type,
		...err,
	});
}
