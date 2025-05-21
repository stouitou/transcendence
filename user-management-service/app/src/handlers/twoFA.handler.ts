import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthServiceController } from '../controllers/authService.controller';

const authServiceController = new AuthServiceController();

export async function get2FAStatus(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.status2FA(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return reply.status(500).send({ error: error.message });
  }
}
export async function get2FAStatusById(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.status2FA(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return reply.status(500).send({ error: error.message });
  }
}

export async function enable2FA(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.enable2FA(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return reply.status(500).send({ error: error.message });
  }
}

export async function disable2FA(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.disable2FA(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return reply.status(500).send({ error: error.message });
  }
}

export async function disable2FAById(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.disable2FAById(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error disabling 2FA by id:', error);
    return reply.status(500).send({ error: error.message });
  }
}

export async function generate2FAQrCode(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await authServiceController.generate2FAQrCode(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error generating 2FA QR code:', error);
    return reply.status(500).send({ error: error.message });
  }
}

/* export async function verify2FA(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { code } = req.body as { code: string };
    if (!code || code.length !== 6) {
      return reply.status(400).send({ error: 'Invalid 2FA code' });
    }
    const result = await authServiceController.verify2FA(req);
    return reply.send(result);
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return reply.status(500).send({ error: error.message });
  } 
}*/