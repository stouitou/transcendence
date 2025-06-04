// __test__/mailService.test.ts
import { send2FAEmail } from '../services/mail.service'; // adapte le chemin
import nodemailer from 'nodemailer';
import { ServiceUnavailableError } from '../Errors/errors';

jest.mock('nodemailer');

const sendMailMock = jest.fn();

// @ts-ignore
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe('send2FAEmail', () => {
  const to = 'test@example.com';
  const code = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait envoyer un email avec succès', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'mock-id' });

    await expect(send2FAEmail(to, code)).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject: expect.any(String),
        html: expect.any(String),
      })
    );
  });

  it('devrait lancer une ServiceUnavailableError si l\'envoi échoue', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP Error'));

    await expect(send2FAEmail(to, code)).rejects.toThrow(ServiceUnavailableError);
    await expect(send2FAEmail(to, code)).rejects.toThrow('Error sending email');
  });
});
