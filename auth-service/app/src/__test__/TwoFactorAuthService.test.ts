import { TwoFactorAuthService } from '../services/TwoFactorAuthServices';
import { NotFoundError, ValidationError } from '../Errors/errors';

jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('qrcode')),
}));
jest.mock('../utils/crypto', () => ({
  decrypt: jest.fn((v) => v),
}));
jest.mock('../utils/totp', () => ({
  generateTOTPSecret: jest.fn((email) => ({ secret: 'secret', otpauth: `otpauth://${email}` })),
  verifyTOTP: jest.fn(() => true),
}));

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;
  let mockUserRepo: any;
  let mockAuthProviderRepo: any;
  let app: any;

  beforeEach(() => {
    mockUserRepo = {
      getById: jest.fn(),
      getOneByParams: jest.fn(),
    };
    mockAuthProviderRepo = {
      set2FASecret: jest.fn().mockResolvedValue(true),
      set2FAEmailCode: jest.fn().mockResolvedValue(true),
      getOneByParams: jest.fn(),
      update: jest.fn(),
    };
    app = {};
    service = new TwoFactorAuthService(app as any);
    // Inject mocks
    (service as any).userRepository = mockUserRepo;
    (service as any).authProviderRepository = mockAuthProviderRepo;
  });

  describe('generate2FASecret', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.getById.mockResolvedValue(null);
      await expect(service.generate2FASecret(1)).rejects.toThrow(NotFoundError);
    });

    it('should return empty buffer if no otpauth', async () => {
      mockUserRepo.getById.mockResolvedValue({ authProviders: [{ provider_id: 'mail' }] });
      jest.spyOn(service, 'get2FASecret').mockResolvedValue({ secret: 'secret', otpauth: null });
      const result = await service.generate2FASecret(1);
      expect(result).toEqual(Buffer.from([]));
    });

    it('should return QR code buffer if otpauth exists', async () => {
      mockUserRepo.getById.mockResolvedValue({ authProviders: [{ provider_id: 'mail' }] });
      jest.spyOn(service, 'get2FASecret').mockResolvedValue({ secret: 'secret', otpauth: 'otpauth://mail' });
      const result = await service.generate2FASecret(1);
      expect(result).toEqual(Buffer.from('qrcode'));
    });
  });

  describe('get2FASecret', () => {
    it('should throw if email missing', async () => {
      await expect(service.get2FASecret('')).rejects.toThrow(ValidationError);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.getOneByParams.mockResolvedValue(null);
      await expect(service.get2FASecret('mail')).rejects.toThrow(NotFoundError);
    });

    it('should generate and save secret', async () => {
      mockUserRepo.getOneByParams.mockResolvedValue({
        authProviders: [{ id: 1, provider_id: 'mail' }]
      });
      const result = await service.get2FASecret('mail');
      expect(result.secret).toBe('secret');
      expect(result.otpauth).toContain('otpauth://');
      expect(mockAuthProviderRepo.set2FASecret).toHaveBeenCalledWith(1, 'secret');
    });
  });

  describe('generate2FAEmailCode', () => {
    it('should throw if user missing', async () => {
      await expect(service.generate2FAEmailCode(null as any)).rejects.toThrow(NotFoundError);
    });

    it('should throw if 2FA not enabled and not forced', async () => {
      const user = { authProviders: [{ two_factor_auth: false }] };
      await expect(service.generate2FAEmailCode(user as any)).rejects.toThrow();
    });

    it('should return existing valid OTP', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 60000);
      const user = { authProviders: [{ two_factor_auth: true, otp: '123456', otpExpiration: future }] };
      const result = await service.generate2FAEmailCode(user as any);
      expect(result.otp).toBe('123456');
    });

    it('should generate and save new OTP', async () => {
      const user = { authProviders: [{ id: 1, two_factor_auth: true }] };
      const result = await service.generate2FAEmailCode(user as any);
      expect(typeof result.otp).toBe('string');
      expect(mockAuthProviderRepo.set2FAEmailCode).toHaveBeenCalled();
    });
  });

  describe('verify2FAEmailCode', () => {
    it('should throw if authProviders missing', async () => {
      await expect(service.verify2FAEmailCode(null, '123456')).rejects.toThrow(NotFoundError);
    });

    it('should throw if 2FA not enabled and not forced', async () => {
      const authProviders = { two_factor_auth: false };
      await expect(service.verify2FAEmailCode(authProviders as any, '123456')).rejects.toThrow(ValidationError);
    });

    it('should throw if no OTP', async () => {
      const authProviders = { two_factor_auth: true };
      await expect(service.verify2FAEmailCode(authProviders as any, '123456')).rejects.toThrow(NotFoundError);
    });

    it('should throw if OTP expired', async () => {
      const past = new Date(Date.now() - 60000);
      const authProviders = { two_factor_auth: true, otp: '123456', otpExpiration: past };
      await expect(service.verify2FAEmailCode(authProviders as any, '123456')).rejects.toThrow(ValidationError);
    });

    it('should return true if code matches', async () => {
      const future = new Date(Date.now() + 60000);
      const authProviders = { id: 1, two_factor_auth: true, otp: '123456', otpExpiration: future };
      const result = await service.verify2FAEmailCode(authProviders as any, '123456');
      expect(result).toBe(true);
      expect(mockAuthProviderRepo.set2FAEmailCode).toHaveBeenCalledWith(1, "", expect.any(Date));
    });

    it('should return false if code does not match', async () => {
      const future = new Date(Date.now() + 60000);
      const authProviders = { id: 1, two_factor_auth: true, otp: '654321', otpExpiration: future };
      const result = await service.verify2FAEmailCode(authProviders as any, '123456');
      expect(result).toBe(false);
    });
  });

  describe('verify2FATOTPCode', () => {
    it('should throw if authProviders missing', async () => {
      await expect(service.verify2FATOTPCode(null, '123456')).rejects.toThrow(NotFoundError);
    });

    it('should throw if 2FA not enabled', async () => {
      const authProviders = { two_factor_auth: false };
      await expect(service.verify2FATOTPCode(authProviders as any, '123456')).rejects.toThrow(ValidationError);
    });

    it('should throw if no secret', async () => {
      const authProviders = { two_factor_auth: true };
      await expect(service.verify2FATOTPCode(authProviders as any, '123456')).rejects.toThrow(ValidationError);
    });

    it('should return true if TOTP is valid', async () => {
      const authProviders = { two_factor_auth: true, two_factor_auth_secret: 'secret' };
      const result = await service.verify2FATOTPCode(authProviders as any, '123456');
      expect(result).toBe(true);
    });
  });

  describe('verify2FACode', () => {
    it('should throw if user not found', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue(null);
      await expect(service.verify2FACode('mail', 'email', '123456')).rejects.toThrow(NotFoundError);
    });

    it('should call verify2FATOTPCode for totp', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue({ two_factor_auth: true, two_factor_auth_secret: 'secret' });
      const spy = jest.spyOn(service, 'verify2FATOTPCode').mockResolvedValue(true);
      const result = await service.verify2FACode('mail', 'totp', '123456');
      expect(spy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call verify2FAEmailCode for email', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue({ two_factor_auth: true, otp: '123456', otpExpiration: new Date(Date.now() + 60000), id: 1 });
      const spy = jest.spyOn(service, 'verify2FAEmailCode').mockResolvedValue(true);
      const result = await service.verify2FACode('mail', 'email', '123456');
      expect(spy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('enable2FA', () => {
    it('should throw if user not found', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue(null);
      await expect(service.enable2FA('mail', 'totp')).rejects.toThrow(NotFoundError);
    });

    it('should update user for 2FA', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue({ id: 1 });
      await service.enable2FA('mail', 'totp');
      expect(mockAuthProviderRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        two_factor_auth: true,
        two_factor_auth_method: 'totp'
      }));
    });
  });

  describe('disable2FA', () => {
    it('should throw if user not found', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue(null);
      await expect(service.disable2FA('mail')).rejects.toThrow(ValidationError);
    });

    it('should update user for 2FA disable', async () => {
      mockAuthProviderRepo.getOneByParams.mockResolvedValue({ id: 1 });
      await service.disable2FA('mail');
      expect(mockAuthProviderRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        two_factor_auth: false,
        two_factor_auth_method: 'email'
      }));
    });
  });
});