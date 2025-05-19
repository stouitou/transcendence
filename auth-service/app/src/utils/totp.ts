import { authenticator } from 'otplib';
import { decrypt, encrypt } from './crypto';

export function generateTOTPSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'TonApp', secret);
  const secretHased = encrypt(secret);
  return { secret:secretHased, otpauth };
}

export function verifyTOTP(token: string, secretHased: string) {
  const secret =  decrypt(secretHased);
  return authenticator.verify({ token, secret });
}
