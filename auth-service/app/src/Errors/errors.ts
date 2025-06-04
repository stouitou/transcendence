// Base error class
export class AppError extends Error {
	public code: string;
	public field?: string;
	public status: number;

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

		Error.captureStackTrace(this, this.constructor);
	}
}

// Validation error
// 400 Bad Request
/**
 * * Custom error class for validation errors.
 * * Returns an 400 Bad Request status code.
 * * This class extends the base AppError class and is used to represent validation errors
 * * that occur during the processing of requests.
 * @returns {ValidationError} An instance of ValidationError with a specific message and field.

 */
export class ValidationError extends AppError {
	constructor(message: string, field: string) {
		super(message, 400, "ERROR_VALIDATION", "ValidationError", field);
		this.name = "ValidationError";
	}
}

//503 Service Unavailable
export class ServiceUnavailableError extends AppError {
	constructor(message = "Service Unavailable") {
		super(message, 503, "ERROR_SERVICE_UNAVAILABLE", "ServiceUnavailableError");
		this.name = "ServiceUnavailableError";
	}
}

// CSRF error
// 403 Forbidden
export class CustomCSRFError extends AppError {
  constructor(message: string, code: "ERROR_CSRF_INVALID" | "ERROR_CSRF_EXPIRED") {
	super(message, 403, code, '_csrf');
	this.name = "CSRFError";
  }
}

// Auth error
// 401 Unauthorized
export class AuthError extends AppError {
	constructor(message = "Authentication required") {
		super(message, 401, "ERROR_AUTH", "AuthError");
		this.name = "AuthError";
	}
}

// Not found error
// 404 Not Found
export class NotFoundError extends AppError {
	constructor(message = "Not found") {
		super(message, 404, "ERROR_NOT_FOUND", "NotFoundError");
		this.name = "NotFoundError";
	}
}

// two-factor authentication error
// 401 Unauthorized
export class TwoFactorAuthError extends AppError {
	constructor(message = "Two-factor authentication is required",
		code: "ERROR_TWO_FACTOR_AUTH" | "ERROR_TWO_FACTOR_AUTH_REQUIRED"| "ERROR_TWO_FACTOR_AUTH_INVALID" = "ERROR_TWO_FACTOR_AUTH") {
		super(message, 401, code, "TwoFactorAuthError");
		this.name = "TwoFactorAuthError";
	}
}