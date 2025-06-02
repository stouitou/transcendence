import { Type } from '@sinclair/typebox';
import { AppErrorSchema, HeadersSchema, MetaSchema, namePattern, UsersSchema } from './utils.schema';

export const AdminSchema = {
	 getUsers: {
		description: 'Get all users',
		tags: ['Admin', 'Users'],
		summary: 'Get all users',
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
				data: Type.Array(UsersSchema),
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
				  total : { type: 'number', description: 'Total number of items', default: 0 },
			},
		},	
		security: [{ bearerAuth: [] }],
	  },

  updateUserById: {
		description: 'Update user by ID',
		tags: ['Admin', 'Users'],
		summary: 'Update user by ID',
		Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		body: Type.Object({
			name: Type.Optional(Type.String({
				minLength: 2,
				maxLength: 20,
				pattern: namePattern,
				description: "Nom de 2 à 20 caractères, lettres, chiffres, _ @ . - autorisés",
				examples: ["Sup3r-User_01", "Jean.Doe", "user@42"]
			})),
			role: Type.Optional(Type.String({
				description: "Rôle de l'utilisateur, 'user' ou 'admin'",
				examples: ["user", "admin"]
			})),
			avatar: Type.Optional(Type.String({
				description: "URL de l'avatar de l'utilisateur",
				examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"]
			})),
		}),
		params: Type.Object({
			id: Type.Number({ description: "ID de l'utilisateur à mettre à jour", examples: [1] }),
		}),
		response: {
			200: UsersSchema,
			...AppErrorSchema
		},
		security: [{ bearerAuth: [] }],
	},

  deleteUserById: {
	description: 'Delete user by ID',
	tags: ['Admin', 'Users'],
	summary: 'Delete user by ID',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	params: Type.Object({
		id: Type.Number({ description: "ID de l'utilisateur à supprimer", examples: [1] }),
	}),
	response: {
		200: Type.Any(), // Pas de contenu à retourner, juste un statut 200
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

  get2FAStatus: {
	description: 'Get the 2FA status of the current user',
	tags: ['Admin','Users', '2FA'],
	summary: 'Get current user 2FA status',
	Headers: HeadersSchema,
	params: Type.Object({
		id: Type.Number({ description: "ID de l'utilisateur pour lequel vérifier le statut 2FA", examples: [1] }),
	}),
	response: {
		200: Type.Object({
			provider: Type.String({ examples: ["local", "google", "github", "facebook"] }),
			provider_id: Type.String({ examples: ["<provider_user_id>"] }),
			two_factor_auth: Type.Boolean({ examples: [true, false] }),
			two_factor_auth_method: Type.Optional(Type.String({ examples: ["email", "totp"] })),
		}),
		...AppErrorSchema
	},
	},
  disable2FA: {
	description: 'Disable 2FA for the current user',
	tags: ['Admin','Users', '2FA'],
	summary: 'Disable 2FA for current user',
	Headers: HeadersSchema,
	params: Type.Object({
		id: Type.Number({ description: "ID de l'utilisateur pour lequel désactiver le 2FA", examples: [1] }),
	}),
	body: Type.Object({}),
	response: {
		200: Type.Object({
			message: Type.String({ examples: ["2FA disabled successfully"] }),
		}),
		...AppErrorSchema
	},
	},

	updateUserAvatarById: {
		description: 'Update user avatar by ID',
		tags: ['Admin', 'Users'],
		summary: 'Update user avatar by ID',
    	consumes: ['multipart/form-data'],
		Headers: HeadersSchema,
		params: Type.Object({
			id: Type.String({ description: "ID de l'utilisateur pour lequel mettre à jour l'avatar", examples: ["1"] }),
		}),
		response: {
			200: UsersSchema,
			...AppErrorSchema
		},
		security: [{ bearerAuth: [] }],
	},

};
