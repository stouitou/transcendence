
export const mockAuthService = {
  validateUser: jest.fn(),
  createUser: jest.fn(),
  generateTemp2FAToken: jest.fn().mockReturnValue('mock-temp-token'),
  generateToken: jest.fn().mockReturnValue('mock-jwt-token')
};
