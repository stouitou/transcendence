import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthServiceController } from '../controllers/authService.controller';

const authServiceController = new AuthServiceController();

export async function get2FAStatus(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.status2FA(req);
    return reply.send(result);
}
export async function get2FAStatusById(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.status2FA(req);
    return reply.send(result);
}

export async function enable2FA(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.enable2FA(req);
    return reply.send(result);
}

export async function disable2FA(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.disable2FA(req);
    return reply.send(result);
}

export async function disable2FAById(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.disable2FAById(req);
    return reply.send(result);
}

export async function generate2FAQrCode(req: FastifyRequest, reply: FastifyReply) {
    const result = await authServiceController.generate2FAQrCode(req);
    return reply.send(result);
}
