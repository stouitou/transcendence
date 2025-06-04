import { AuthController } from '../controllers/auth.controller';
import { FastifyRequest, FastifyReply } from 'fastify';
import { generateCSRFToken } from '../utils/crypto'; // à mocker si nécessaire

jest.mock('../utils/crypto', () => ({
  generateCSRFToken: jest.fn(() => 'mock-csrf-token')
}));

describe('AuthController.login()', () => {
  it('should log in user and set authToken cookie when 2FA is not enabled', async () => {
    // 🧪 FAUX UTILISATEUR (2FA désactivé)
    const fakeUser = {
      id: 1,
      email: 'test@mail.com',
      authProviders: [
        {
          two_factor_auth: false
        }
      ]
    };

    // 🧪 MOCK DES SERVICES
    const mockAuthService = {
      validateUser: jest.fn().mockResolvedValue(fakeUser),
      generateToken: jest.fn().mockReturnValue('mock-jwt-token')
    };

    const mockTwoFactorService = {
      generate2FAEmailCode: jest.fn()
    };

    // 🧪 MOCK DU CONTEXT `this.app`
    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorService
    } as any);

    // 🧪 FAUSSE REQUEST & REPLY
    const req = {
      body: {
        email: 'test@mail.com',
        password: 'Azerty1234@'
      },
      session: {} as any
    } as unknown as FastifyRequest;

    const reply = {
      setCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    // ✅ APPEL DE LA MÉTHODE
    await controller.login(req, reply);

    // ✅ ASSERTIONS
    expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@mail.com', 'Azerty1234@');
    expect(mockAuthService.generateToken).toHaveBeenCalledWith(fakeUser);
    expect(reply.setCookie).toHaveBeenCalledWith(
      'authToken',
      'mock-jwt-token',
      expect.objectContaining({ httpOnly: true })
    );
    expect(reply.send).toHaveBeenCalledWith({ token: 'mock-jwt-token' });
    expect(req.session.userID).toBe(1);
    expect(req.session.crsfToken).toBe('mock-csrf-token');
  });
});
