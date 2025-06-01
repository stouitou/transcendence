import { AppError, NotFoundError, ServiceUnavailableError, TwoFactorAuthError } from './errors';
import { ValidationError } from './errors';
import { CSRFError } from './errors';
// ...import d’autres erreurs personnalisées

type ErrorData = {
  name?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  field?: string;
  details?: any; // Pour les erreurs qui ont des détails supplémentaires
  [key: string]: any;
};

export class ErrorFactory {
  private static registry: Record<string, (data: ErrorData) => AppError> = {
	AuthError:       (data) => new AppError(data.message || "Authentication required", 401, "ERROR_AUTH", "AuthError", data.field),
    ValidationError: (data) => new ValidationError(data.message || "Validation failed", data.field || "unknown"),
    CSRFError:       (data) => new CSRFError(data.message || "CSRF error", (data.code as "ERROR_CSRF_INVALID" | "ERROR_CSRF_EXPIRED") || "ERROR_CSRF_INVALID"),
	NotFoundError:   (data) => new NotFoundError(data.message || "Resource not found", data.details),
  ServiceUnavailableError: (data) => new ServiceUnavailableError(data.message || "Service Unavailable"),
	/*
	app.setNotFoundHandler((request, reply) => {
  console.error('Route not found:', request.raw.url);
  return reply.status(404).send({
    success: false,
    statusCode: 404,
    error: "NotFound",
    type: "NotFoundError",
    name: "NotFoundError",
    message: "Route not found",
    timestamp: new Date().toISOString(),
    details: {
      method: request.raw.method,
      url: request.raw.url,}
  });
});
*/
	TwoFactorAuthError: (data) => new TwoFactorAuthError(data.message || "Two-factor authentication required",(data.code as "ERROR_TWO_FACTOR_AUTH" | "ERROR_TWO_FACTOR_AUTH_REQUIRED"| "ERROR_TWO_FACTOR_AUTH_INVALID") || "ERROR_TWO_FACTOR_AUTH"),
    // Ajoute ici d'autres erreurs personnalisées…
  };

  public static fromRemoteError(data: ErrorData): AppError {
    if (!data || typeof data !== 'object') {
      return new AppError("Erreur distante malformée", 400, "MALFORMED_REMOTE_ERROR", "AppError");
    }

    const { name = "AppError" } = data;

    const builder = this.registry[name];

    if (builder) {
      return builder(data);
    }

    // Si erreur non reconnue, on ne panique pas : on la reconstruit quand même proprement.
    return new AppError(
      data?.message || "Une erreur distante inconnue est survenue.",
      data?.statusCode || 500,
      data?.code || "UNKNOWN_REMOTE_ERROR",
      data?.field,
      name
    );
  }
}
