import { CrsfController } from '../controllers/crsf.controller';

describe('CrsfController', () => {
  let controller: CrsfController;
  const map = CrsfController.getWsCSRFTokenMap();
  let req: any;
  let reply: any;

  beforeEach(() => {
    controller = new CrsfController({} as any);
    req = { session: {} };
    reply = {
      code: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  describe('generateCSRFToken', () => {
    it('should generate and return a CSRF token', async () => {
      const result = await controller.generateCSRFToken(req, reply);
      expect(typeof result.csrfToken).toBe('string');
      expect(req.session.csrfToken).toBe(result.csrfToken);
      expect(req.session.csrfTokenExpiration).toBeGreaterThan(Date.now());
    });
  });

  describe('validateCSRFToken', () => {
    it('should return success if token is valid and not expired', async () => {
      req.session.csrfToken = 'token';
      req.session.csrfTokenExpiration = Date.now() + 10000;
      req.body = { csrfToken: 'token' };
      const result = await controller.validateCSRFToken(req, reply);
      expect(result).toEqual({ success: true });
    });

    it('should return 403 if token is missing or invalid', async () => {
      req.session.csrfToken = 'token';
      req.session.csrfTokenExpiration = Date.now() + 10000;
      req.body = { csrfToken: 'bad' };
      await controller.validateCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Invalid CSRF token' });
    });

    it('should return 403 if token is expired', async () => {
      req.session.csrfToken = 'token';
      req.session.csrfTokenExpiration = Date.now() - 10000;
      req.body = { csrfToken: 'token' };
      await controller.validateCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'CSRF token expired' });
    });
  });

  describe('generateWsCSRFToken', () => {
    it('should return 403 if userID is missing', () => {
      req.session.userID = undefined;
      controller.generateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should generate and store a ws CSRF token', () => {
      req.session.userID = 42;
      const result = controller.generateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  });

  describe('validateWsCSRFToken', () => {
    it('should return 403 if csrfToken or userId is missing', () => {
      req.body = {};
      controller.validateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Missing csrfToken or userId' });
    });

    it('should return 403 if token not found for userId', () => {
      req.body = { csrfToken: 'abc', userId: 123 };
      controller.validateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Token not found for userId' });
    });

    it('should return 403 if token mismatch', () => {
      const req = { session: {
			userID: 1,
	  } } as any;
      // Génère un token pour userId 1
      controller.generateWsCSRFToken(req, reply);
      req.body = { csrfToken: 'bad', userId: 1 };
      controller.validateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Token mismatch' });
    });

    it('should return 403 if token expired', () => {
		const req = { session: {
			userID: 2,
			csrfToken: 'tok',
			csrfTokenExpiration: Date.now()
		} } as any;
      // Force expiration
      const wsCSRFTokenMap = map;
      if (wsCSRFTokenMap) {
        wsCSRFTokenMap.set(2, { token: 'tok', expiresAt: Date.now() - 1000 });
      }
      req.body = { csrfToken: 'tok', userId: 2 };
      controller.validateWsCSRFToken(req, reply);
      expect(reply.code).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Token expired' });
    });

    it('should return success if token is valid and not expired', () => {
	const req = { session: {
			userID: 3
		} } as any;
      const wsCSRFTokenMap = global['wsCSRFTokenMap'];
      controller.generateWsCSRFToken(req, reply);
      // Récupère le token généré depuis la reply
     
	  const token = reply.send.mock.calls[0][0].token;
		console.error("✅ [validateWsCSRFToken] Token valid", token);
      req.body = { csrfToken: token, userId: 3 };
      const result = controller.validateWsCSRFToken(req, reply);
      expect(result).toEqual({ success: true });
    });
  });
});