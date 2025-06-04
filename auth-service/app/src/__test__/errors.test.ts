import { FastifyInstance } from 'fastify';
import {handleErrors } from '../Errors/handler';
import {AppError, AuthError, CustomCSRFError, NotFoundError, ServiceUnavailableError, ValidationError  } from '../Errors/errors';

beforeEach(() => {
  jest.clearAllMocks();
});
test('should return 404 for NotFoundError', () => {
  const error = new NotFoundError('Not found');
  const result = handleErrors(error);
  expect(result.status).toBe(404);
  expect(result.type).toBe('NotFoundError');
  expect(result.message).toBe('Not found');
  expect(result.code).toBe('ERROR_NOT_FOUND');
  expect(result.timestamp).toBeDefined();
});

test('should return 400 for ValidationError', () => {
  const error = new ValidationError('Invalid input data',"email");
  const result = handleErrors(error);
  expect(result.status).toBe(400);
  expect(result.type).toBe('ValidationError');
  expect(result.message).toBe('Invalid input data');
  expect(result.code).toBe('ERROR_VALIDATION');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBe('email');
});

test('should return 500 for generic error', () => {
  const error = new Error('Something went wrong');
  const result = handleErrors(error);
  expect(result.status).toBe(500);
  expect(result.type).toBe('Error');
  expect(result.message).toBe('Something went wrong');
  expect(result.code).toBe('UNKNOWN_ERROR');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});
test('should return 500 for undefined error', () => {
  const error = new AppError('An unexpected error occurred');
  const result = handleErrors(error);
  expect(result.status).toBe(500);
  expect(result.type).toBe('AppError');
  expect(result.message).toBe('An unexpected error occurred');
  expect(result.code).toBe('APP_ERROR');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should return 403 for CSRFError', () => {
  const error = new CustomCSRFError('Invalid CSRF token', 'ERROR_CSRF_INVALID');
  const result = handleErrors(error);
  expect(result.status).toBe(403);
  expect(result.type).toBe('CSRFError');
  expect(result.message).toBe('Invalid CSRF token');
  expect(result.code).toBe('ERROR_CSRF_INVALID');
  expect(result.timestamp).toBeDefined();
});


test('should return 401 for UnauthorizedError', () => {
  const error = new AuthError('Unauthorized access');
  const result = handleErrors(error);
  expect(result.status).toBe(401);
  expect(result.type).toBe('AuthError');
  expect(result.message).toBe('Unauthorized access');
  expect(result.code).toBe('ERROR_AUTH');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should return 503 for ServiceUnavailableError', () => {
  const error = new ServiceUnavailableError('Service is currently unavailable');
  const result = handleErrors(error);
  expect(result.status).toBe(503);
  expect(result.type).toBe('ServiceUnavailableError');
  expect(result.message).toBe('Service is currently unavailable');
  expect(result.code).toBe('ERROR_SERVICE_UNAVAILABLE');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should return 401 for JsonWebTokenError', () => {
  const error = new Error('jwt malformed');
	error.name = 'JsonWebTokenError';
  const result = handleErrors(error);
  expect(result.status).toBe(401);
  expect(result.type).toBe('JsonWebTokenError');
  expect(result.message).toBe('jwt malformed');
  expect(result.code).toBe('ERROR_JWT_INVALID');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should return 400 for ValidationError', () => {
  const error: Error & { validation?: Record<string, { instancePath: string; message: string }> } = new Error('Invalid input data');
  error.name = 'ValidationError';
  error.validation = {
	0: { instancePath: '/email', message: 'Email is required' }
  };
  const result = handleErrors(error);
  expect(result.status).toBe(400);
  expect(result.type).toBe('ValidationError');
  expect(result.message).toBe('Email is required');
  expect(result.code).toBe('ERROR_VALIDATION');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBe('email');
});
test('should return 400 for ValidationError', () => {
  const error: Error & { validation?: Record<string, { instancePath: string;}> } = new Error('Invalid input data');
  error.name = 'ValidationError';
  error.validation = {
	0: { instancePath: '/email' }
  };
  const result = handleErrors(error);
  expect(result.status).toBe(400);
  expect(result.type).toBe('ValidationError');
  expect(result.message).toBe('Invalid input data'); // fallback sur error.message
  expect(result.code).toBe('ERROR_VALIDATION');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBe('email');
});
test('should handle ValidationError with missing message', () => {
  const error: any = new Error('Invalid input data');
  error.name = 'ValidationError';
  error.validation = {
    0: { instancePath: '/email' } // pas de message
  };
  const result = handleErrors(error);
  expect(result.status).toBe(400);
  expect(result.type).toBe('ValidationError');
  expect(result.message).toBe('Invalid input data'); // fallback sur error.message
  expect(result.code).toBe('ERROR_VALIDATION');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBe('email');
});

test('should handle Error with missing message', () => {
  const error: any = new Error();
  const result = handleErrors(error);
  expect(result.status).toBe(500);
  expect(result.type).toBe('Error');
  expect(result.message).toBe('Une erreur inconnue s\'est produite.');
  expect(result.code).toBe('UNKNOWN_ERROR');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should handle Error with missing message but name is set', () => {
  const error: any = new Error();
  error.name = 'CustomError';
  const result = handleErrors(error);
  expect(result.status).toBe(500);
  expect(result.type).toBe('CustomError');
  expect(result.message).toBe('Une erreur inconnue s\'est produite.');
  expect(result.code).toBe('UNKNOWN_ERROR');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should handle Error with missing message but name is set', () => {

  const result = handleErrors({});
  expect(result.status).toBe(500);
  expect(result.type).toBe('UnknownError');
  expect(result.message).toBe('Une erreur inconnue s\'est produite.');
  expect(result.code).toBe('UNKNOWN_ERROR');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should handle ValidationError with missing validation[0]', () => {
  const error: any = new Error('Invalid input data');
  error.name = 'ValidationError';
  error.validation = {}; // ou []
  const result = handleErrors(error);
  expect(result.status).toBe(400);
  expect(result.type).toBe('ValidationError');
  expect(result.message).toBe('Invalid input data');
  expect(result.code).toBe('ERROR_VALIDATION');
  expect(result.timestamp).toBeDefined();
  expect(result.field).toBeUndefined();
});

test('should handle unknown error with custom status, name, message, code', () => {
  const error: any = {
    status: 418,
    name: 'TeapotError',
    message: 'I am a teapot',
    code: 'ERROR_TEAPOT'
  };
  const result = handleErrors(error);
  expect(result.status).toBe(418);
  expect(result.type).toBe('TeapotError');
  //expect(result.name).toBe('TeapotError');
  expect(result.message).toBe('I am a teapot');
  expect(result.code).toBe('ERROR_TEAPOT');
  expect(result.timestamp).toBeDefined();
});