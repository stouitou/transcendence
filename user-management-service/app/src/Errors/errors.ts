// Base error class
export class AppError extends Error {
	public code: string;
	public field?: string;
	public status: number;
	public timestamp: string;

	constructor(
		message: string,
		status = 500,
		code = "APP_ERROR",
		name = "AppError",
		field?: string,
	) {
		super(message);
		this.name = name;
		this.status = status;
		this.code = code;
		this.field = field;
		this.timestamp = new Date().toISOString();

		Error.captureStackTrace(this, this.constructor);
	}
}

// Validation error
// 400 Bad Request
export class ValidationError extends AppError {
	constructor(message: string, field: string) {
		super(message, 400, "ERROR_VALIDATION", "ValidationError", field);
		this.name = "ValidationError";
	}
}

// CSRF error
// 403 Forbidden
export class CSRFError extends AppError {
  constructor(message: string, code: "ERROR_CSRF_INVALID" | "ERROR_CSRF_EXPIRED") {
	super(message, 403, code, '_csrf');
	this.name = "CSRFError";
  }
}

// Auth error
// 401 Unauthorized
export class AuthError extends AppError {
	constructor(message = "Authentification requise") {
		super(message, 401, "ERROR_AUTH", "AuthError");
		this.name = "AuthError";
	}
}

// Not found error
// 404 Not Found
export class NotFoundError extends AppError {
	details?: any;
	constructor(message = "Ressource non trouvée",details?: any) {
		super(message, 404, "ERROR_NOT_FOUND", "NotFoundError");
		this.name = "NotFoundError";
		this.details = details;
	}
}

// two-factor authentication error
// 401 Unauthorized
export class TwoFactorAuthError extends AppError {
	constructor(message = "Authentification à deux facteurs requise",
		code: "ERROR_TWO_FACTOR_AUTH" | "ERROR_TWO_FACTOR_AUTH_REQUIRED"| "ERROR_TWO_FACTOR_AUTH_INVALID" = "ERROR_TWO_FACTOR_AUTH") {
		super(message, 401, code, "TwoFactorAuthError");
		this.name = "TwoFactorAuthError";
	}
}

//503 Service Unavailable
export class ServiceUnavailableError extends AppError {
	constructor(message = "Service Unavailable") {
		super(message, 503, "ERROR_SERVICE_UNAVAILABLE", "ServiceUnavailableError");
		this.name = "ServiceUnavailableError";
	}
}