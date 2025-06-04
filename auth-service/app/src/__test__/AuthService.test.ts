import { AuthService } from '../services/auth.service';
import { ValidationError } from '../Errors/errors';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockAuthProviderRepo: any;
  let app: any;

  beforeEach(() => {
    mockUserRepo = {
      getOneByParams: jest.fn(),
      create: jest.fn(),
    };
    mockAuthProviderRepo = {
      update: jest.fn(),
      set2FASecret: jest.fn(),
    };
    app = {
      jwt: {
        sign: jest.fn(() => 'jwt-token'),
        verify: jest.fn(() => ({ id: 1, name: 'John', avatar: '', role: 'user' })),
      },
    };
    service = new AuthService(app as any);
    (service as any).UserRepository = mockUserRepo;
    (service as any).AuthProviderRepository = mockAuthProviderRepo;
  });

  it('generateToken should call app.jwt.sign', () => {
    const token = service.generateToken({ id: 1, name: 'John', avatar: '', role: 'user' });
    expect(token).toBe('jwt-token');
    expect(app.jwt.sign).toHaveBeenCalled();
  });

  it('validateUser: should return user if password is valid', async () => {
    mockUserRepo.getOneByParams.mockResolvedValue({ authProviders: [{ password: 'hash' }] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const user = await service.validateUser('mail', 'pw');
    expect(user).toBeTruthy();
  });

  it('validateUser: should return null if user not found', async () => {
    mockUserRepo.getOneByParams.mockResolvedValue(null);
    const user = await service.validateUser('mail', 'pw');
    expect(user).toBeNull();
  });

  it('validateUser: should return null if password is invalid', async () => {
    mockUserRepo.getOneByParams.mockResolvedValue({ authProviders: [{ password: 'hash' }] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const user = await service.validateUser('mail', 'pw');
    expect(user).toBeNull();
  });

  it('validateAuthProvider: should return user if found', async () => {
    mockUserRepo.getOneByParams.mockResolvedValue({ id: 1 });
    const user = await service.validateAuthProvider('mail', 'local');
    expect(user).toEqual({ id: 1 });
  });

  it('validateAuthProvider: should return null if not found', async () => {
    mockUserRepo.getOneByParams.mockResolvedValue(null);
    const user = await service.validateAuthProvider('mail', 'local');
    expect(user).toBeNull();
  });

  it('createUser: should hash password and create user', async () => {
    (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed');
    mockUserRepo.create.mockResolvedValue({ id: 1, name: 'John' });
    const user = await service.createUser('John', 'mail', 'pw');
    expect(user).toEqual({ id: 1, name: 'John' });
    expect(mockUserRepo.create).toHaveBeenCalled();
  });

  it('createUserWithOauthProvider: should return OauthProviderResponse if user created', async () => {
    service.registerWithOauthProvider = jest.fn().mockResolvedValue({ id: 1, role: 'user', name: 'John', avatar: '' });
    const result = await service.createUserWithOauthProvider({}, 'google');
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
  });

  it('createUserWithOauthProvider: should throw if user exists', async () => {
    service.registerWithOauthProvider = jest.fn().mockResolvedValue(null);
    await expect(service.createUserWithOauthProvider({}, 'google')).rejects.toThrow(ValidationError);
  });

  it('updatePassword: should hash password and update AuthProvider', async () => {
    (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed');
    mockAuthProviderRepo.update.mockResolvedValue({ id: 1 });
    const result = await service.updatePassword(1, 'pw');
    expect(result).toEqual({ id: 1 });
    expect(mockAuthProviderRepo.update).toHaveBeenCalled();
  });

  it('refreshToken: should generate new token if valid', () => {
    const token = service.refreshToken('token');
    expect(token).toBe('jwt-token');
  });

  it('refreshToken: should throw if invalid', () => {
    app.jwt.verify = jest.fn(() => { throw new Error('fail'); });
    expect(() => service.refreshToken('bad')).toThrow();
  });
});