import { generateErrorResponse } from '../Errors/handler';
import { AuthError } from '../Errors/errors';

describe('generateErrorResponse', () => {
  it('should call reply.status and reply.send with correct error object', () => {
    // Mock FastifyReply
    const statusMock = jest.fn().mockReturnThis();
    const sendMock = jest.fn();
    const reply = { status: statusMock, send: sendMock } as any;

    // Crée une erreur à tester
    const error = new AuthError('Unauthorized access');

    // Appelle la fonction
    generateErrorResponse(reply, error);

    // Vérifie les appels
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      statusCode: 401,
      error: 'AuthError',
      message: 'Unauthorized access',
      code: 'ERROR_AUTH'
    }));
  });
});