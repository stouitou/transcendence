import 'fastify';
import { Session } from '@fastify/session';

declare module "fastify" {
	interface FastifyInstance {
		fortyTwoOAuth2: any;
	}
}