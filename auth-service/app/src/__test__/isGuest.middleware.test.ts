import { isGuest } from '../middleware/isGuest.middleware';

describe('isGuest middleware', () => {
  let req: any;
  let reply: any;

  beforeEach(() => {
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  it('should do nothing if no session', async () => {
    req = { session: undefined, cookies: {} };
    await isGuest(req, reply);
    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('should return 403 if session exists and valid token', async () => {
    req = {
      session: { userID: 1, destroy: jest.fn() },
      cookies: { authToken: 'Bearer validtoken' },
      server: { jwt: { verify: jest.fn().mockReturnValue({ id: 1 }) } }
    };
    await isGuest(req, reply);
    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({ error: "You are already logged in" });
  });

  it('should destroy session and clear cookies if token is invalid', async () => {
    const destroyMock = jest.fn();
    req = {
      session: { userID: 1, destroy: destroyMock },
      cookies: { authToken: 'Bearer invalidtoken' },
      server: { jwt: { verify: jest.fn(() => { throw new Error('invalid'); }) } }
    };
    await isGuest(req, reply);
    expect(destroyMock).toHaveBeenCalled();
    expect(reply.clearCookie).not.toHaveBeenCalled(); // cookies cleared only if no token
    expect(reply.status).not.toHaveBeenCalledWith(403);
  });

  it('should destroy session and clear cookies if no authToken', async () => {
    const destroyMock = jest.fn();
    req = {
      session: { userID: 1, destroy: destroyMock },
      cookies: {},
      server: { jwt: { verify: jest.fn() } }
    };
    await isGuest(req, reply);
    expect(destroyMock).toHaveBeenCalled();
    expect(reply.clearCookie).toHaveBeenCalledWith("authToken");
    expect(reply.clearCookie).toHaveBeenCalledWith("authToken2FA");
    expect(reply.clearCookie).toHaveBeenCalledWith("authForgetPasswordToken");
    expect(reply.clearCookie).toHaveBeenCalledWith("authForgetPasswordToken2FA");
    expect(reply.clearCookie).toHaveBeenCalledWith("sessionId");
  });
});