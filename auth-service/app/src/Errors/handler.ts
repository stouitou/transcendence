import { FastifyReply } from "fastify";
import { AppError } from "./errors";

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
			timestamp,
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
	const { status,name ,type, ...err } = handleErrors(error);
	console.log("🔴 generateErrorResponse:", status, type, err);

	return reply.status(status).send({
		success: false,
		statusCode: status,
		name: name,
		error: type,
		...err,
	});
}
