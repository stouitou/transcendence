import { FastifyInstance } from 'fastify';
import { buildServer } from './server';
import { AuthController } from '../controllers/auth.controller';
let server:FastifyInstance;
beforeAll(async () => {
  server = await buildServer();
  server.delete('/delete/:email',async (request, reply) => {
    const authController = new AuthController(server);
    return authController.deleteUserByEmail(request, reply);
  });
});

afterAll(async () => {
  await server.close();
});

test('POST /login returns 400 with no valid password constraint', async () => {
  const response = await server.inject({
    method: 'POST',
    url: 'api/auth/login',
    payload: { email: 'test_jest@mail.com', password: 'password' }
  });
  expect(response.statusCode).toBe(400);
});

test('POST /login returns 403 with no valid password', async () => {
  const response = await server.inject({
    method: 'POST',
    url: 'api/auth/login',
    payload: { email: 'test_jest@mail.com', password: 'Azerty1234@' }
  });
  expect(response.statusCode).toBe(403);
  //CSRFError
  expect(response.json()).toEqual({
	success: false,
	statusCode: 403,
    code: "ERROR_CSRF_INVALID",
	error: 'CSRFError',
	name: 'CSRFError',
	message: 'Invalid CSRF token',
	timestamp: expect.any(String),
  });
});


test('POST /login with valid CSRF token', async () => {
  // 1. Récupère le CSRF token et le cookie de session
  const csrfRes = await server.inject({ method: 'GET', url: '/api/auth/csrf' });
  expect(csrfRes.statusCode).toBe(200);
  const csrfData = csrfRes.json();
  expect(csrfData).toHaveProperty('csrfToken');
  const csrfToken = csrfData.csrfToken;
  expect(csrfToken).toBeDefined();
  expect(csrfRes.cookies).toBeDefined();
  const cookies = csrfRes.cookies.map(c => `${c.name}=${c.value}`).join(';');

  // 2. Utilise-les dans la requête POST
  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'test_jest@mail.com', password: 'Azerty1234@' },
    headers: {
      'x-csrf-token': csrfToken,
      'cookie': cookies
    }
  });

  expect(response.statusCode).toBe(401);

   expect(response.json()).toEqual({
	success: false,
	statusCode: 401,
    code: "ERROR_AUTH",
	error: 'AuthError',
	name: 'AuthError',
	message: 'Invalid credentials',
	timestamp: expect.any(String),
  });
});


//register user
test('POST /register with valid data', async () => {

  // 1. Récupère le CSRF token et le cookie de session
  const csrfRes = await server.inject({ method: 'GET', url: '/api/auth/csrf' });
  expect(csrfRes.statusCode).toBe(200);
  const csrfData = csrfRes.json();
  expect(csrfData).toHaveProperty('csrfToken');
  const csrfToken = csrfData.csrfToken;
  expect(csrfToken).toBeDefined();
  expect(csrfRes.cookies).toBeDefined();
  const cookies = csrfRes.cookies.map(c => `${c.name}=${c.value}`).join(';');
  const response = await server.inject({
	method: 'POST',
	url: '/api/auth/register',
	payload: {
	  name: 'TestJest',
	  email: 'test_jest@mail.com',
	  password: 'Azerty1234@'
	},
	headers: {
	  'x-csrf-token': csrfToken,
	  'cookie': cookies
	}
  });
  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual({
	token: expect.any(String),
  });
});
test('POST /register with existing email', async () => {
	  // 1. Récupère le CSRF token et le cookie de session
  const csrfRes = await server.inject({ method: 'GET', url: '/api/auth/csrf' });
  expect(csrfRes.statusCode).toBe(200);
  const csrfData = csrfRes.json();
  expect(csrfData).toHaveProperty('csrfToken');
  const csrfToken = csrfData.csrfToken;
  expect(csrfToken).toBeDefined();
  expect(csrfRes.cookies).toBeDefined();
  const cookies = csrfRes.cookies.map(c => `${c.name}=${c.value}`).join(';');
  // 2. Utilise-les dans la requête POST
  const response = await server.inject({
	method: 'POST',
	url: '/api/auth/register',
	payload: {
	  name: 'TestJest',
	  email: 'test_jest@mail.com',
	  password: 'Azerty1234@'
	},
	headers: {
	  'x-csrf-token': csrfToken,
	  'cookie': cookies
	}
  });
  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
	success: false,
	statusCode: 400,//409
	code: "ERROR_VALIDATION",//ERROR_USER_EXISTS
	error: 'ValidationError',
	name: 'ValidationError',
	message: 'User already exists',
	field: 'email',
	timestamp: expect.any(String),
  });
});


//delete user
test('DELETE /user with valid CSRF token', async () => {
  // 1. Récupère le CSRF token et le cookie de session
  const csrfRes = await server.inject({ method: 'GET', url: '/api/auth/csrf' });
  expect(csrfRes.statusCode).toBe(200);
  const csrfData = csrfRes.json();
  expect(csrfData).toHaveProperty('csrfToken');
  const csrfToken = csrfData.csrfToken;
  expect(csrfToken).toBeDefined();
  expect(csrfRes.cookies).toBeDefined();
  const cookies = csrfRes.cookies.map(c => `${c.name}=${c.value}`).join(';');

  // 2. Utilise-les dans la requête DELETE
  const response = await server.inject({
	method: 'DELETE',
	url: '/delete/test_jest@mail.com',
	headers: {
	  'x-csrf-token': csrfToken,
	  'cookie': cookies
	}
  });
  expect(response.statusCode).toBe(204);
});