import { authenticator } from 'otplib';

export function generateTOTPSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'TonApp', secret);
  return { secret, otpauth };
}

export function verifyTOTP(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}
