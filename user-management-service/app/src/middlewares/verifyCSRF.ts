import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyCSRF(req: FastifyRequest, reply: FastifyReply) {
	const csrfToken = req.headers['x-csrf-token'];
    const res = await fetch('http://auth_services:3000/internal/auth/validate-csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': req.headers.cookie ?? '',
      },
      body: JSON.stringify({ csrfToken })
    });
    if (!res.ok) {
      console.error("[CSRF token validation failed] 🔴 Invalid CSRF token");
	  console.log("🔴 CSRF token validation failed",res);
      return reply.code(403).send({ error: 'Invalid CSRF token' });
    }
  console.log("🟢 CSRF token verified");
}