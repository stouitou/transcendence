import { AuthController } from '../controllers/auth.controller';
import { FastifyRequest, FastifyReply } from 'fastify';
import { send2FAEmail } from '../services/mail.service';

// 🧪 Mock de send2FAEmail
jest.mock('../services/mail.service', () => ({
  send2FAEmail: jest.fn()
}));

describe('AuthController.login() - 2FA email', () => {
  it('should trigger 2FA email flow and set temp token', async () => {
    // 🧪 Utilisateur fictif avec 2FA activé par email
    const fakeUser = {
      id: 1,
      email: 'user@test.com',
      authProviders: [
        {
          provider_id: 'provider-123',
          two_factor_auth: true,
          two_factor_auth_method: 'email'
        }
      ]
    };

    // 🧪 Simulations des services
    const mockAuthService = {
      validateUser: jest.fn().mockResolvedValue(fakeUser),
      generateTemp2FAToken: jest.fn().mockReturnValue('mock-temp-token'),
      generateToken: jest.fn()
    };

    const mockTwoFactorService = {
      generate2FAEmailCode: jest.fn().mockResolvedValue({
        otp: '123456',
        otpExpiration: new Date(Date.now() + 300000)
      })
    };

    const controller = new AuthController({
      authService: mockAuthService,
      twoFactorAuthService: mockTwoFactorService
    } as any);

    // 🧪 Fausse requête Fastify
    const req = {
      body: {
        email: 'user@test.com',
        password: 'password123'
      },
      session: {} as any
    } as unknown as FastifyRequest;

    // 🧪 Faux reply Fastify
    const reply = {
      setCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as FastifyReply;

    // ✅ Appel de la méthode
    await controller.login(req, reply);

    // ✅ Vérifications
    expect(mockAuthService.validateUser).toHaveBeenCalledWith('user@test.com', 'password123');
    expect(mockAuthService.generateTemp2FAToken).toHaveBeenCalledWith('provider-123', 'email');
    expect(mockTwoFactorService.generate2FAEmailCode).toHaveBeenCalledWith(fakeUser);
    expect(send2FAEmail).toHaveBeenCalledWith('user@test.com', '123456');
    expect(reply.setCookie).toHaveBeenCalledWith(
      'authToken2FA',
      'mock-temp-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 350,
        path: '/',
        sameSite: 'strict'
      })
    );
    expect(reply.send).toHaveBeenCalledWith({
      twoFactorRequired: true,
      method: 'email'
    });
  });
});