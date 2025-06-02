/**
 * BaseError class for handling errors in the application.
 * This class extends the built-in Error class and adds a type property.
 * It is used to categorize errors into different types.
 */
export class BaseError extends Error {
  public type: string;

  constructor(type: string, message: string) {
    super(message);
    this.type = type;
    this.name = 'BaseError';
  }
}

/**
 * ApiError class for handling API errors.
 * This class extends the BaseError class and adds a status property.
 * It is used to categorize API errors based on their HTTP status codes.
 */
export class ApiError extends BaseError {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super('apiError', message);
    this.statusCode = statusCode;
  }
}

export class ApiErrorBase extends BaseError {
  public statusCode: number;
  public error:string = "ApiErrorBase";
  public message:string = "Invalid message";
  public success:boolean = false;
  public name:string = "APPError";
  public code:string = "ERROR_APP";
  field?:string;
  details?:any;
  public timestamp?:string;

  constructor( errorData?: {name:string, statusCode: number, message: string, error?: string, code?: string ,timestamp?: string, success?: boolean, field?: string, details?: any}) {
    super(errorData?.name || 'apiError', errorData?.message || 'Unknown error');
    this.statusCode = errorData?.statusCode || 500;
    this.error = errorData?.error || "AuthError";
    this.message = errorData?.message || "Invalid credentials";
    this.success = errorData?.success || false;
    this.name = errorData?.name || "AuthError";
    this.code = errorData?.code || "ERROR_AUTH";
    this.timestamp = errorData?.timestamp || new Date().toISOString();
    if (errorData?.field) {
      this.field = errorData.field;
    }
    if (errorData?.details) {
      this.details = errorData.details;
    }
  }
}
//{"statusCode":401,
// "error":"AuthError",
// "message":"Invalid credentials",
// "success":false,
// "name":"AuthError",
// "code":"ERROR_AUTH",
// "timestamp":"2025-05-31T09:16:22.427Z"}
/**
 *  *** not used yet ***
 * FormError class for handling form validation errors.
 * This class extends the BaseError class and adds a field property.
 */
export class FormError extends BaseError {
  public field: string;

  constructor(field: string, message: string) {
    super('formError', message);
    this.field = field;
  }
}
