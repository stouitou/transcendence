// src/__test__/AuthController.test.ts

import { AuthController } from '../controllers/auth.controller';
import { mockAuthService } from './__mocks__/authService.mock';
import { mockTwoFactorAuthService } from './__mocks__/twoFactorAuthService.mock';
import { fakeUserWith2FA, fakeUserWithout2FA, fakeUserNoAuthProviders } from './__mocks__/fakeUsers';
import { FastifyReply } from 'fastify';

// 🧪 Mock de send2FAEmail
jest.mock('../services/mail.service', () => ({
  send2FAEmail: jest.fn()
}));
const createMockReply = ()=> ({
  setCookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
}) as unknown as FastifyReply;

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each([
  {
    name: 'Utilisateur sans 2FA',
    user: fakeUserWithout2FA,
    expectedToken: 'mock-jwt-token',
    expect2FA: false
  },
  {
    name: 'Utilisateur avec 2FA email',
    user: fakeUserWith2FA,
    expectedToken: null,
    expect2FA: true
  },
  {
    name: 'Utilisateur sans authProvider',
    user: fakeUserNoAuthProviders,
    expectedToken: 'mock-jwt-token',
    expect2FA: false
  }
])('$name', ({ user, expectedToken, expect2FA }) => {
  it(`devrait ${expect2FA ? 'demander' : 'ne pas demander'} une 2FA`, async () => {
    mockAuthService.validateUser.mockResolvedValueOnce(user);

    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorAuthService
    } as any);

    const req = {
      body: { email: user.email, password: 'valid' },
      session: {}
    } as any;

    const reply = createMockReply();

    await controller.login(req, reply );

    if (expect2FA) {
      expect(reply.setCookie).toHaveBeenCalledWith('authToken2FA', 'mock-temp-token', expect.any(Object));
      expect(reply.send).toHaveBeenCalledWith({ twoFactorRequired: true, method: 'email' });
    } else {
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(user);
      expect(reply.setCookie).toHaveBeenCalledWith('authToken', 'mock-jwt-token', expect.any(Object));
      expect(reply.send).toHaveBeenCalledWith({ token: 'mock-jwt-token' });
    }
  });
});




import { FastifyRequest } from 'fastify';
import { ValidationError } from '../Errors/errors';
//import { mockAuthService } from './mocks/authService.mock';
import { mockAuthProviderRepository } from './__mocks__/authProviderRepository.mock';

describe('AuthController.register', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ should register a new user and return a token', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword'
      }
    } as FastifyRequest;

    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorAuthService
    } as any);
    mockAuthProviderRepository.getByParams.mockResolvedValue(null);
	(controller as any).AuthProviderRepository = mockAuthProviderRepository;

	const fakeUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockAuthService.createUser.mockResolvedValue(fakeUser);
    mockAuthService.generateToken.mockReturnValue('mock-jwt-token');

    await controller.register(req, reply);

    expect(mockAuthProviderRepository.getByParams).toHaveBeenCalledWith({
      provider_id: 'john@example.com',
      provider: 'local'
    });
    expect(mockAuthService.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com', 'securepassword');
    expect(mockAuthService.generateToken).toHaveBeenCalledWith(fakeUser);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ token: 'mock-jwt-token' });
  });

  it('❌ should return error if user already exists', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword'
      }
    } as FastifyRequest;

    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    mockAuthProviderRepository.getByParams.mockResolvedValueOnce(fakeUserWith2FA);
    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorAuthService,
    } as any);
	(controller as any).AuthProviderRepository = mockAuthProviderRepository;

    await controller.register(req, reply);

    expect(reply.status).not.toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'ValidationError',
      field: 'email',
      code: "ERROR_VALIDATION",
      name: "ValidationError",
      message: "User already exists",
      statusCode: 400,
      success: false,
      timestamp: expect.any(String)
    }));
  });

  it('❌ should return error if createUser returns null', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword'
      }
    } as FastifyRequest;

    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorAuthService
    } as any);
    mockAuthProviderRepository.getByParams.mockResolvedValue(null);
    mockAuthService.createUser.mockResolvedValue(null);

    await controller.register(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'ValidationError',
      field: 'name',
      code: "ERROR_VALIDATION",
      name: "ValidationError",
      message: "User already exists",
      statusCode: 400,
      success: false,
      timestamp: expect.any(String)
    }));
  });

  it('❌ should handle unexpected error', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword'
      }
    } as FastifyRequest;

    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorAuthService
    } as any);
    mockAuthProviderRepository.getByParams.mockRejectedValue(new ValidationError('User already exists', 'name'));

    await controller.register(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'ValidationError',
      field: 'name',
      code: "ERROR_VALIDATION",
      name: "ValidationError",
      message: "User already exists",
      statusCode: 400,
      success: false,
      timestamp: expect.any(String)
    }));
  });
});


describe('AuthController.logout', () => {
  it('✅ should destroy session and clear cookies', async () => {
    const req = {
      session: { destroy: jest.fn(cb => cb()), userID: 1 }
    } as any;
    const reply = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any;

    const controller = new AuthController({} as any);
    await controller.logout(req, reply);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(reply.clearCookie).toHaveBeenCalledWith('sessionId');
    expect(reply.clearCookie).toHaveBeenCalledWith('authToken');
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: "Logged out" });
  });

  it('❌ should handle session destroy error', async () => {
    const req = {
      session: { destroy: jest.fn(cb => cb(new Error('fail'))) }
    } as any;
    const reply = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any;

    const controller = new AuthController({} as any);
    await controller.logout(req, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: "Failed to destroy session" });
  });
});


describe('AuthController.me', () => {
  it('✅ should return decoded user if token and session are valid', async () => {
    const fakeDecoded = { id: 1 };
    const req = {
      headers: { authorization: 'Bearer validtoken' },
      session: { userID: 1 }
    } as any;
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any;
    const controller = new AuthController({
      jwt: { verify: jest.fn().mockReturnValue(fakeDecoded) }
    } as any);

    await controller.me(req, reply);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(fakeDecoded);
  });

  it('❌ should throw if no token provided', async () => {
    const req = { headers: {}, session: {} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.me(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'AuthError',
      message: 'No token provided'
    }));
  });

  it('❌ should throw if session expired', async () => {
    const fakeDecoded = { id: 1 };
    const req = {
      headers: { authorization: 'Bearer validtoken' },
      session: {}
    } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({
      jwt: { verify: jest.fn().mockReturnValue(fakeDecoded) }
    } as any);

    await controller.me(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'AuthError',
      message: 'Session expired or not found'
    }));
  });

  it('❌ should throw if token does not match session', async () => {
    const fakeDecoded = { id: 2 };
    const req = {
      headers: { authorization: 'Bearer validtoken' },
      session: { userID: 1 }
    } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({
      jwt: { verify: jest.fn().mockReturnValue(fakeDecoded) }
    } as any);

    await controller.me(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'AuthError',
      message: 'Token does not match session'
    }));
  });
});

describe('AuthController.decodeToken', () => {
  it('✅ should decode token and return payload', async () => {
    const fakeDecoded = { id: 1 };
    const req = { headers: { authorization: 'Bearer validtoken' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({
      jwt: { verify: jest.fn().mockReturnValue(fakeDecoded) }
    } as any);

    await controller.decodeToken(req, reply);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(fakeDecoded);
  });

  it('❌ should return 401 if no token provided', async () => {
    const req = { headers: {} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.decodeToken(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it('❌ should handle jwt errors', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({
      jwt: { verify: jest.fn(() => { throw new Error('jwt expired'); }) }
    } as any);

    await controller.decodeToken(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "Token expired", statusText: "Token expired" });
  });
});

describe('AuthController.updateMePassword', () => {
  it('✅ should update password if all is valid', async () => {
    const req = {
      body: { oldPassword: 'old', newPassword: 'new' },
      cookies: { authToken: 'token' }
    } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const fakeUser = { authProviders: [{ id: 1, provider: 'local', provider_id: 'john@example.com', password: 'old' }] };

    const controller = new AuthController({
      jwt: { verify: jest.fn().mockReturnValue({ id: 1 }) },
      authService: {
        isValidResetPassword: jest.fn().mockResolvedValue(true),
        updatePassword: jest.fn().mockResolvedValue(true)
      }
    } as any);
    (controller as any).UserRepository = { getById: jest.fn().mockResolvedValue(fakeUser) };

    await controller.updateMePassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalled();
  });

  it('❌ should throw if oldPassword or newPassword missing', async () => {
    const req = { body: {} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.updateMePassword(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'ValidationError',
      message: 'Old password and new password are required'
    }));
  });

  it('❌ should throw if passwords are the same', async () => {
    const req = { body: { oldPassword: 'same', newPassword: 'same' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.updateMePassword(req, reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
      error: 'ValidationError',
      message: 'Old password and new password cannot be the same'
    }));
  });

});


describe('AuthController.loginForgetPassword', () => {
  it('✅ should return twoFactorRequired if user not found', async () => {
    const req = { body: { email: 'john@example.com' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({ authService: { validateAuthProvider: jest.fn().mockResolvedValue(null) } } as any);

    await controller.loginForgetPassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ twoFactorRequired: true, method: 'email' });
  });

  it('✅ should set 2FA cookie and send email if user has 2FA email', async () => {
    const user = { authProviders: [{ provider_id: 'john@example.com', two_factor_auth_method: 'email' }] };
    const req = { body: { email: 'john@example.com' } } as any;
    const reply = { setCookie: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const mockAuthService = {
      validateAuthProvider: jest.fn().mockResolvedValue(user),
      generateTemp2FAToken: jest.fn().mockReturnValue('temp-token'),
      generateToken: jest.fn().mockReturnValue('jwt-token')
    };
    const mock2FA = { generate2FAEmailCode: jest.fn().mockResolvedValue({ otp: '123456', otpExpiration: Date.now() + 300000 }) };
    const controller = new AuthController({ authService: mockAuthService, twoFactorAuthService: mock2FA } as any);

    // Mock send2FAEmail
    jest.spyOn(require('../services/mail.service'), 'send2FAEmail').mockResolvedValue(undefined);

    await controller.loginForgetPassword(req, reply);

    expect(reply.setCookie).toHaveBeenCalledWith('authToken2FA', 'temp-token', expect.any(Object));
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ twoFactorRequired: true, method: 'email' });
  });

  it('✅ should set forgot password token if user has no 2FA', async () => {
    const user = { authProviders: [{ provider_id: 'john@example.com', two_factor_auth_method: 'totp' }] };
    const req = { body: { email: 'john@example.com' } } as any;
    const reply = { setCookie: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const mockAuthService = {
      validateAuthProvider: jest.fn().mockResolvedValue(user),
      generateTemp2FAToken: jest.fn().mockReturnValue('temp-token'),
      generateToken: jest.fn().mockReturnValue('jwt-token')
    };
    const controller = new AuthController({ authService: mockAuthService } as any);

    await controller.loginForgetPassword(req, reply);

    expect(reply.setCookie).toHaveBeenCalledWith('authToken2FA', 'temp-token', expect.any(Object));
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ twoFactorRequired: true, method: 'totp' });
  });
});

describe('AuthController.loginResetPassword', () => {
  it('❌ should return 400 if password is missing', async () => {
    const req = { body: {}, cookies: {} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.loginResetPassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: "Password is required" });
  });

  it('❌ should return 401 if no token provided', async () => {
    const req = { body: { password: 'newpass' }, cookies: {} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

    await controller.loginResetPassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it('❌ should return 401 if token is invalid', async () => {
    const req = { body: { password: 'newpass' }, cookies: { authForgetPasswordToken: 'badtoken' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const mockJwt = { verify: jest.fn().mockReturnValue(undefined), decode: jest.fn() };
    const controller = new AuthController({ jwt: mockJwt } as any);

    await controller.loginResetPassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it('❌ should return 401 if user not found', async () => {
    const req = { body: { password: 'newpass' }, cookies: { authForgetPasswordToken: 'token' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const mockJwt = { verify: jest.fn().mockReturnValue({ id: 1 }), decode: jest.fn() };
    const controller = new AuthController({ jwt: mockJwt } as any);
    (controller as any).UserRepository = { getById: jest.fn().mockResolvedValue(null) };

    await controller.loginResetPassword(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "User not found" });
  });

  it('✅ should reset password and return token', async () => {
    const req = { body: { password: 'newpass' }, cookies: { authForgetPasswordToken: 'token' } } as any;
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      clearCookie: jest.fn(),
      setCookie: jest.fn()
    } as any;
    const mockJwt = { verify: jest.fn().mockReturnValue({ id: 1 }), decode: jest.fn() };
    const mockUser = { authProviders: [{ id: 2, provider: 'local', provider_id: 'john@example.com', password: 'old' }] };
    const mockAuthService = {
      updatePassword: jest.fn().mockResolvedValue(true),
      generateToken: jest.fn().mockReturnValue('jwt-token')
    };
    const controller = new AuthController({ jwt: mockJwt, authService: mockAuthService } as any);
    (controller as any).UserRepository = { getById: jest.fn().mockResolvedValue(mockUser) };

    await controller.loginResetPassword(req, reply);

    expect(reply.clearCookie).toHaveBeenCalledWith('authForgetPasswordToken');
    expect(reply.setCookie).toHaveBeenCalledWith('authToken', 'jwt-token', expect.any(Object));
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ token: 'jwt-token', message: "Password changed successfully" });
  });
});

describe('AuthController.deleteUserByEmail', () => {
  it('❌ should throw if email param is missing', async () => {
    const req = { params: {email:undefined} } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);

	await controller.deleteUserByEmail(req, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it('❌ should throw if user not found', async () => {
    const req = { params: { email: 'john@example.com' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);
    (controller as any).UserRepository = { getOneByParams: jest.fn().mockResolvedValue(null) };
	await controller.deleteUserByEmail(req, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it('✅ should delete user and return 204', async () => {
    const req = { params: { email: 'john@example.com' } } as any;
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    const controller = new AuthController({} as any);
    (controller as any).UserRepository = {
      getOneByParams: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockResolvedValue(true)
    };

    await controller.deleteUserByEmail(req, reply);

    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalled();
  });
});