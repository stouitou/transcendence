import { internal } from '../middleware/internal';

describe('internal middleware', () => {
  let req: any;
  let reply: any;

  beforeEach(() => {
    reply = { code: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  it('should allow non-internal route', async () => {
    req = { raw: { url: '/public' }, hostname: 'localhost', ip: '127.0.0.1' };
    await internal(req, reply);
    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('should allow internal route from internal host', async () => {
    req = { raw: { url: '/internal/health' }, hostname: 'auth_services', ip: '172.16.0.1' };
    await internal(req, reply);
    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('should forbid internal route from external host', async () => {
    req = { raw: { url: '/internal/health' }, hostname: 'localhost', ip: '127.0.0.1' };
    await internal(req, reply);
    expect(reply.code).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Forbidden' });
  });
});