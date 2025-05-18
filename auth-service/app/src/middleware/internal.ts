import { FastifyRequest, FastifyReply } from "fastify";

export async function internal(req: FastifyRequest, reply: FastifyReply) {
  if (req.raw.url?.startsWith('/internal')) {
    const isInternal = req.hostname?.startsWith('auth_services') || req.ip?.startsWith('172.');
	console.log("[MIDDLEWARE] isInternal", isInternal);
    if (!isInternal) {
	console.log("🔴 Forbidden: Internal route access denied");
      return reply.code(403).send({ error: 'Forbidden' });
    }
  }
}