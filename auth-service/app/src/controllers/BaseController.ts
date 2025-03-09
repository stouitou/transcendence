import { FastifyInstance } from "fastify";

export class BaseController {
  protected app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }
}