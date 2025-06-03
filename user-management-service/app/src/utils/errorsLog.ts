import { ErrorResponse } from "../Errors/handler";

export const errorsLog = (error: ErrorResponse) => {
	console.log(`🔴 [generateErrorResponse:] ${error.timestamp.toLocaleString()} [${error.status}] [${error.type}] "${error.message}" ${error.field ? `Field: ${error.field}` : ""} ${error.code ? `Code: ${error.code}` : ""} ${error.details ? `Details: ${JSON.stringify(error.details)}` : ""}`);
}
