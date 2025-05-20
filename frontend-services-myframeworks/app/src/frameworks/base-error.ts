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
  public status: number;

  constructor(status: number, message: string) {
    super('apiError', message);
    this.status = status;
  }
}

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
