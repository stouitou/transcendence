// src/__test__/mocks/twoFactorAuthService.mock.ts

export const mockTwoFactorAuthService = {
  generate2FAEmailCode: jest.fn().mockResolvedValue({
    otp: '123456',
    otpExpiration: Date.now() + 300000
  })
};
