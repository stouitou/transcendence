import { FastifyReply, FastifyRequest } from "fastify";
import { errorDebugLog } from "./logger.middleware";

export async function reconstructAuthHeader(req: FastifyRequest, reply: FastifyReply) {
  const authToken = req.cookies.authToken;
  if (authToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${authToken}`;
    errorDebugLog("middleware", "reconstructAuthHeader", "Reconstructed Authorization header from cookie");
  }
}