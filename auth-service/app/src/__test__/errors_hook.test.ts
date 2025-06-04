import { buildServer } from './server'; // ta fonction utilitaire
import { AppError, AuthError, CustomCSRFError, NotFoundError, ServiceUnavailableError, TwoFactorAuthError, ValidationError } from '../Errors/errors';
import { FastifyInstance } from 'fastify';

let server: FastifyInstance;

beforeAll(async () => {
  server = await buildServer();
  // Ajoute ici toutes les routes de test
  server.get('/test-not-found', async () => { throw new NotFoundError('Not found'); });
  server.get('/test-not-found-no-message', async () => { throw new NotFoundError(); });

  server.get('/test-validation-error', async () => { throw new ValidationError('Invalid input data', 'email'); });
  server.get('/test-csrf-error', async () => { throw new CustomCSRFError('Invalid CSRF token', 'ERROR_CSRF_INVALID'); });
  server.get('/test-auth-error', async () => { throw new AuthError('Unauthorized access'); });
  server.get('/test-auth-error-no-message', async () => { throw new AuthError(); });
  server.get('/test-two-factor-auth-error', async () => { throw new TwoFactorAuthError(); });
  server.get('/test-app-unknow-error', async () => { throw new Error('An unexpected error occurred'); });
  server.get('/test-app-generic-error', async () => { throw new AppError('An unexpected error occurred'); });
  server.get('/test-service-unavailable-error', async () => { throw new ServiceUnavailableError('Service is currently unavailable'); });
  server.get('/test-service-unavailable-error-no-message', async () => { throw new ServiceUnavailableError(); });
  server.get('/test-jwt-error', async () => { 
	const error = new Error('jwt malformed');
	error.name = 'JsonWebTokenError';
	throw error;
  });
  server.get('/non-valid-field', async () => {
	  const error: Error & { validation?: Record<string, { instancePath: string; message: string }> } = new Error('Invalid input data');
		error.name = 'ValidationError';
		error.validation = {
			0: { instancePath: '/email', message: 'Email is required' }
		};
	throw error;
	});
});

afterAll(async () => {
  await server.close();
});

/**
 * Tests pour les erreurs personnalisées
 * 404 NotFoundError
 * 400 ValidationError
 * 403 CSRFError
 * 500 AppError
 * 401 AuthError
 * 407 ServiceUnavailableError
 */
test('should format NotFoundError via setErrorHandler', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/test-not-found'
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('NotFoundError');
  expect(body.message).toBe('Not found');
  expect(body.code).toBe('ERROR_NOT_FOUND');
  expect(body.timestamp).toBeDefined();
});
test('should format NotFoundError via setErrorHandler with missing message', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/test-not-found-no-message'
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('NotFoundError');
  expect(body.message).toBe('Not found');
  expect(body.code).toBe('ERROR_NOT_FOUND');
  expect(body.timestamp).toBeDefined();
});
test('should handle 404 Not Found via setNotFoundHandler', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/non-existent-route'
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('NotFoundError');
  expect(body.message).toBe('Not found');
  expect(body.code).toBe('ERROR_NOT_FOUND');
  expect(body.timestamp).toBeDefined();
});

test('should handle ValidationError', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-validation-error'
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('ValidationError');
  expect(body.message).toBe('Invalid input data');
  expect(body.code).toBe('ERROR_VALIDATION');
  expect(body.field).toBe('email');
  expect(body.timestamp).toBeDefined();
});

test('should handle CSRFError', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-csrf-error'
  });

  expect(response.statusCode).toBe(403);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('CSRFError');
  expect(body.message).toBe('Invalid CSRF token');
  expect(body.code).toBe('ERROR_CSRF_INVALID');
  expect(body.timestamp).toBeDefined();
});

test('should handle AuthError', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-auth-error'
  });

  expect(response.statusCode).toBe(401);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('AuthError');
  expect(body.message).toBe('Unauthorized access');
  expect(body.code).toBe('ERROR_AUTH');
  expect(body.timestamp).toBeDefined();
});
test('should handle AuthError with missing message', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-auth-error-no-message'
  });

  expect(response.statusCode).toBe(401);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('AuthError');
  expect(body.message).toBe('Authentication required');
  expect(body.code).toBe('ERROR_AUTH');
  expect(body.timestamp).toBeDefined();
});

test('should handle TwoFactorAuthError', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-two-factor-auth-error'
  });

  expect(response.statusCode).toBe(401);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('TwoFactorAuthError');
  expect(body.message).toBe('Two-factor authentication is required');
  expect(body.code).toBe('ERROR_TWO_FACTOR_AUTH');
  expect(body.timestamp).toBeDefined();
});



test('should handle generic UNKNOWN_ERROR AppError', async () => {

  const response = await server.inject({
	method: 'GET',
	url: '/test-app-unknow-error'
  });

  expect(response.statusCode).toBe(500);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('Error');
  expect(body.message).toBe('An unexpected error occurred');
  expect(body.code).toBe('UNKNOWN_ERROR');
  expect(body.timestamp).toBeDefined();
});
test('should handle generic AppError', async () => {

  const response = await server.inject({
	method: 'GET',
	url: '/test-app-generic-error'
  });

  expect(response.statusCode).toBe(500);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('AppError');
  expect(body.message).toBe('An unexpected error occurred');
  expect(body.code).toBe('APP_ERROR');
  expect(body.timestamp).toBeDefined();
});
test('should handle ServiceUnavailableError', async () => {

  const response = await server.inject({
	method: 'GET',
	url: '/test-service-unavailable-error'
  });

  expect(response.statusCode).toBe(503);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('ServiceUnavailableError');
  expect(body.message).toBe('Service is currently unavailable');
  expect(body.code).toBe('ERROR_SERVICE_UNAVAILABLE');
  expect(body.timestamp).toBeDefined();
});
test('should handle ServiceUnavailableError with missing message', async () => {

  const response = await server.inject({
	method: 'GET',
	url: '/test-service-unavailable-error-no-message'
  });

  expect(response.statusCode).toBe(503);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('ServiceUnavailableError');
  expect(body.message).toBe('Service Unavailable');
  expect(body.code).toBe('ERROR_SERVICE_UNAVAILABLE');
  expect(body.timestamp).toBeDefined();
});

test('should handle JsonWebTokenError', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/test-jwt-error'
  });

  expect(response.statusCode).toBe(401);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('JsonWebTokenError');
  expect(body.message).toBe('jwt malformed');
  expect(body.code).toBe('ERROR_JWT_INVALID');
  expect(body.timestamp).toBeDefined();
});

test('should handle ValidationError with field', async () => {
  const response = await server.inject({
	method: 'GET',
	url: '/non-valid-field'
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.name).toBe('ValidationError');
  expect(body.message).toBe('Email is required');
  expect(body.code).toBe('ERROR_VALIDATION');
  expect(body.field).toBe('email');
  expect(body.timestamp).toBeDefined();
});