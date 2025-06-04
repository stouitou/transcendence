import { TwoFactorController } from '../controllers/twoFactor.controller';

describe('TwoFactorController', () => {
  let controller: TwoFactorController;
  let req: any;
  let reply: any;
  let mockJwt: any;
  let mockUserRepo: any;
  let mock2FA: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockJwt = { verify: jest.fn() };
    mockUserRepo = { getById: jest.fn(), getOneByParams: jest.fn() };
    mock2FA = { enable2FA: jest.fn(), disable2FA: jest.fn(), generate2FASecret: jest.fn(), verify2FACode: jest.fn() };
    mockAuthService = { generateToken: jest.fn() };

    controller = new TwoFactorController({ jwt: mockJwt, twoFactorAuthService: mock2FA, authService: mockAuthService } as any);
    (controller as any).UserRepository = mockUserRepo;

    req = { cookies: {}, body: {}, params: {}, session: {} };
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      header: jest.fn().mockReturnThis(),
      clearCookie: jest.fn(),
      setCookie: jest.fn()
    };
  });

  describe('getStatus2FA', () => {
    it('should return 401 if no authToken', async () => {
      req.cookies.authToken = undefined;
      await controller.getStatus2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 401 if user not found', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue(null);
      await controller.getStatus2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 400 if no authProviders', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({ authProviders: [] });
      await controller.getStatus2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User has no authProviders" });
    });

    it('should return 200 with 2FA status', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{
          provider: 'local',
          provider_id: 'john@example.com',
          two_factor_auth: true,
          two_factor_auth_method: 'totp'
        }]
      });
      await controller.getStatus2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'local',
        provider_id: 'john@example.com',
        two_factor_auth: true,
        two_factor_auth_method: 'totp'
      }));
    });
  });

  describe('getStatus2FAById', () => {
    it('should return 400 if no userId', async () => {
      req.params = {};
      await controller.getStatus2FAById(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User ID is required" });
    });

    it('should return 401 if not admin', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'user' });
      await controller.getStatus2FAById(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 401 if user not found', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue(null);
      await controller.getStatus2FAById(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 400 if no authProviders', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue({ authProviders: [] });
      await controller.getStatus2FAById(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User has no authProviders" });
    });

    it('should return 200 with 2FA status', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{
          provider: 'local',
          provider_id: 'john@example.com',
          two_factor_auth: true,
          two_factor_auth_method: 'totp'
        }]
      });
      await controller.getStatus2FAById(req, reply);
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'local',
        provider_id: 'john@example.com',
        two_factor_auth: true,
        two_factor_auth_method: 'totp'
      }));
    });
  });

  describe('enable2FA', () => {
    it('should return 400 if method is missing', async () => {
      req.body = {};
      await controller.enable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "Method is required" });
    });

    it('should return 401 if no authToken', async () => {
      req.body = { method: 'totp' };
      req.cookies.authToken = undefined;
      await controller.enable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 401 if user not found', async () => {
      req.body = { method: 'totp' };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue(null);
      await controller.enable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 400 if no authProviders', async () => {
      req.body = { method: 'totp' };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({ authProviders: [] });
      await controller.enable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User has no authProviders" });
    });

    it('should enable 2FA and return 200', async () => {
      req.body = { method: 'totp' };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{ provider_id: 'john@example.com', two_factor_auth: false }]
      });
      mock2FA.enable2FA.mockResolvedValue(true);
      await controller.enable2FA(req, reply);
      expect(mock2FA.enable2FA).toHaveBeenCalledWith('john@example.com', 'totp');
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({ message: "2FA enabled" });
    });
  });

  describe('disable2FA', () => {
    it('should return 401 if no authToken', async () => {
      req.cookies.authToken = undefined;
      await controller.disable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 401 if user not found', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue(null);
      await controller.disable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 400 if no authProviders', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({ authProviders: [] });
      await controller.disable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User has no authProviders" });
    });

    it('should return 400 if already disabled', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{ provider_id: 'john@example.com', two_factor_auth: false }]
      });
      await controller.disable2FA(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "User already has 2FA disable" });
    });

    it('should disable 2FA and return 200', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{ provider_id: 'john@example.com', two_factor_auth: true }]
      });
      mock2FA.disable2FA.mockResolvedValue(true);
      await controller.disable2FA(req, reply);
      expect(mock2FA.disable2FA).toHaveBeenCalledWith('john@example.com');
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({ message: "2FA disable" });
    });
  });

  describe('disable2FAById', () => {
    it('should throw if no userId', async () => {
      req.params = {};
      await expect(controller.disable2FAById(req, reply)).rejects.toThrow("User ID is required");
    });

    it('should throw if not admin', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'user' });
      await expect(controller.disable2FAById(req, reply)).rejects.toThrow("Unauthorized - you must be an admin to disable 2FA for a user");
    });

    it('should throw if user not found', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue(null);
      await expect(controller.disable2FAById(req, reply)).rejects.toThrow("User not found");
    });

    it('should throw if no authProviders', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue({ authProviders: [] });
      await expect(controller.disable2FAById(req, reply)).rejects.toThrow("User has no authProviders");
    });

    it('should throw if already disabled', async () => {
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{ provider_id: 'john@example.com', two_factor_auth: false }]
      });
      await expect(controller.disable2FAById(req, reply)).rejects.toThrow("User already has 2FA disable");
    });

    it('should disable 2FA and return 200', async () => {

    const reply = { setCookie: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
	
      req.params = { id: 1 };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1, role: 'admin' });
      mockUserRepo.getById.mockResolvedValue({
        authProviders: [{ provider_id: 'john@example.com', two_factor_auth: true }]
      });
      mock2FA.disable2FA.mockResolvedValue(true);
      const result = await controller.disable2FAById(req, reply);
      expect(mock2FA.disable2FA).toHaveBeenCalledWith('john@example.com');
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({ message: "2FA disable" });

    });
  });

  describe('generate2FAQRcode', () => {
    it('should throw if no authToken', async () => {
      req.cookies.authToken = undefined;
      await expect(controller.generate2FAQRcode(req, reply)).rejects.toThrow("Unauthorized");
    });

    it('should generate QR code and set headers', async () => {
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mock2FA.generate2FASecret.mockResolvedValue(Buffer.from('qrcode'));
      await controller.generate2FAQRcode(req, reply);
      expect(reply.header).toHaveBeenCalledWith("Content-Type", "image/png");
      expect(reply.send).toHaveBeenCalledWith(Buffer.from('qrcode'));
    });
  });

  describe('verify2FA', () => {
    it('should throw if code is invalid', async () => {
      req.body = { code: '123' };
      await controller.verify2FA(req, reply);
      expect(reply.send).toHaveBeenCalledWith({ 
		code: "ERROR_VALIDATION",
		message: "Invalid or missing code",
		error: "ValidationError",
        name: "ValidationError",
        statusCode: 400,
        field: "code",
        success: false,
		timestamp: expect.any(String)
		});
    });

    it('should throw if isforce is not boolean', async () => {
      req.body = { code: '123456', isforce: 'yes' };
      
      await controller.verify2FA(req, reply);
      expect(reply.send).toHaveBeenCalledWith({ 
		code: "ERROR_VALIDATION",
		message: "Invalid isforce parameter",
		error: "ValidationError",
        name: "ValidationError",
        statusCode: 400,
        field: "isforce",
        success: false,
		timestamp: expect.any(String)
		});
    });

    it('should throw if no authToken2FA', async () => {
      req.body = { code: '123456', isforce: false };
      req.cookies.authToken2FA = undefined;
      await controller.verify2FA(req, reply);
      expect(reply.send).toHaveBeenCalledWith({ 
		code: "ERROR_VALIDATION",
		message: "Unauthorized",
		error: "ValidationError",
        name: "ValidationError",
        statusCode: 400,
        field: "Cookies.authToken2FA",
        success: false,
		timestamp: expect.any(String)
		});
    });

    it('should throw if 2FA code is invalid', async () => {
      req.body = { code: '123456', isforce: false };
      req.cookies.authToken2FA = 'token';
      mockJwt.verify.mockReturnValue({ email: 'john@example.com', method: 'totp' });
      mock2FA.verify2FACode.mockResolvedValue(false);
	  await controller.verify2FA(req, reply);
      expect(reply.send).toHaveBeenCalledWith({ 
		code: "ERROR_TWO_FACTOR_AUTH_INVALID",
		message: "Invalid 2FA code",
		error: "TwoFactorAuthError",
        name: "TwoFactorAuthError",
        statusCode: 401,
        success: false,
		timestamp: expect.any(String)
		});
	  
     // await expect(controller.verify2FA(req, reply)).rejects.toThrow("Invalid 2FA code");
    });

    it('should throw if user not found', async () => {
      req.body = { code: '123456', isforce: false };
      req.cookies.authToken2FA = 'token';
      mockJwt.verify.mockReturnValue({ email: 'john@example.com', method: 'totp' });
      mock2FA.verify2FACode.mockResolvedValue(true);
      mockUserRepo.getOneByParams.mockResolvedValue(null);
      await controller.verify2FA(req, reply);
      expect(reply.send).toHaveBeenCalledWith({ 
		code: "ERROR_NOT_FOUND",
		message: "User not found",
		error: "NotFoundError",
        name: "NotFoundError",
        statusCode: 404,
        success: false,
		timestamp: expect.any(String)
		});
    });

    it('should set cookies and return token if valid', async () => {
      req.body = { code: '123456', isforce: false };
      req.cookies.authToken2FA = 'token';
      mockJwt.verify.mockReturnValue({ email: 'john@example.com', method: 'totp' });
      mock2FA.verify2FACode.mockResolvedValue(true);
      mockUserRepo.getOneByParams.mockResolvedValue({ id: 1 });
      mockAuthService.generateToken.mockReturnValue('jwt-token');
      await controller.verify2FA(req, reply);
      expect(reply.clearCookie).toHaveBeenCalledWith('authToken2FA');
      expect(reply.setCookie).toHaveBeenCalledWith('authToken', 'jwt-token', expect.any(Object));
      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({ token: 'jwt-token' });
    });
  });

  describe('changePassword', () => {
    it('should return 400 if old or new password missing', async () => {
      req.body = {};
      await controller.changePassword(req, reply);
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: "Old password and new password are required" });
    });

    it('should return 401 if no authToken', async () => {
      req.body = { oldPassword: 'old', newPassword: 'new' };
      req.cookies.authToken = undefined;
      await controller.changePassword(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it('should return 401 if user not found', async () => {
      req.body = { oldPassword: 'old', newPassword: 'new' };
      req.cookies.authToken = 'token';
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockUserRepo.getById.mockResolvedValue(null);
      await controller.changePassword(req, reply);
      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    // Ajoute ici le test de succès quand tu implémenteras la suite de la méthode
  });
});