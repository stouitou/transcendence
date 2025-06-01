import { Type } from '@sinclair/typebox';
import { AppErrorSchema, GameSchema, HeadersSchema, MetaSchema, namePattern, passwordPattern, TokenSchema, TournamentSchema, UsersSchema, usersStatsSchema } from './utils.schema';

export const GamesSchema = {

  getGames: {
	description: 'Get all games',
	tags: ['Games'],
	summary: 'Get all games',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	response: {
		200: Type.Object({
			//...ApiResponseSchema,
			success: Type.Boolean({ default: true }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.Optional(Type.String({ examples: ["Opération réussie", 'OK'] })),
			meta: MetaSchema,
			data: Type.Array(GameSchema),
		}),
		...AppErrorSchema
	},
	querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			  filters: { type: 'string', 
				description: 'Filters as JSON string. Exemple: {"type":"local"}',
				examples: ['{"type":"local", "format":"classic"}']
			},
		},
	},	
	security: [{ bearerAuth: [] }],
  },


  getUserGamesByPlayerId: {
	description: 'Get all games',
	tags: ['Games'],
	summary: 'Get all games',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	params: Type.Object({
		id: Type.String({ description: "ID de l'utilisateur pour lequel récupérer les jeux", examples: ["1"] }),
	}),
	response: {
		200: Type.Object({
			//...ApiResponseSchema,
			success: Type.Boolean({ default: true }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.Optional(Type.String({ examples: ["Opération réussie", 'OK'] })),
			meta: MetaSchema,
			data: Type.Array(GameSchema),
		}),
		...AppErrorSchema
	},
	querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			  filters: { type: 'string', 
				description: 'Filters as JSON string. Exemple: {"type":"local"}',
				examples: ['{"type":"local", "format":"classic"}']
			},
		},
	},	
	security: [{ bearerAuth: [] }],
  },


   getTournaments: {
	description: 'Get all tournaments',
	tags: ['Tournaments'],
	summary: 'Get all tournaments',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	response: {
		200: Type.Object({
			//...ApiResponseSchema,
			success: Type.Boolean({ default: true }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.Optional(Type.String({ examples: ["Opération réussie", 'OK'] })),
			meta: MetaSchema,
			data: Type.Array(TournamentSchema),
		}),
		...AppErrorSchema
	},
	querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			  filters: { type: 'string', 
				description: 'Filters as JSON string. Exemple: {"type":"local"}',
				examples: ['{"type":"local"}']
			},
		},
	},	
	security: [{ bearerAuth: [] }],
  },
  getUserTournamentsByUserId: {
	description: 'Get all tournaments',
	tags: ['Tournaments', 'Me'],
	summary: 'Get all tournaments',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	params: Type.Object({
		id: Type.String({ description: "ID de l'utilisateur pour lequel récupérer les jeux", examples: ["1"] }),
	}),
	response: {
		200: Type.Object({
			//...ApiResponseSchema,
			success: Type.Boolean({ default: true }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.Optional(Type.String({ examples: ["Opération réussie", 'OK'] })),
			meta: MetaSchema,
			data: Type.Array(TournamentSchema),
		}),
		...AppErrorSchema
	},
	querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			  filters: { type: 'string', 
				description: 'Filters as JSON string. Exemple: {"type":"local"}',
				examples: ['{"type":"local"}']
			},
		},
	},	
	security: [{ bearerAuth: [] }],
  },
};
