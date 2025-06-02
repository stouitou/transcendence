import { Type } from '@sinclair/typebox';

export const ErrorResponseSchema = Type.Object({
  success: Type.Optional(Type.Boolean({ default: false })), // optionnel si tu veux
  statusCode: Type.Number({ examples: [400, 404, 500] }),
  name: Type.Optional(Type.String({ examples: ["ValidationError", "AuthError", "NotFoundError"] })),
  error: Type.String({ examples: ["ValidationError", "UserExists", "InternalError"] }),
  message: Type.String({ examples: ["Le mot de passe est invalide", "User already exists"] }),
  field: Type.Optional(Type.String({ examples: ["password", "email"] })),
  code: Type.Optional(Type.String({ examples: ["ERROR_VALIDATION", "USER_EXISTS"] })),
  timestamp: Type.Optional(Type.String({ format: 'date-time' })),
  details: Type.Optional(Type.Any()),
});
export const passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[*/+\\-=@_]).{8,}$';
export const namePattern = '^[a-zA-Z0-9_.@-]{2,20}$';

export const AppErrorSchema = {
	400: ErrorResponseSchema, // Erreur de validation
	401: ErrorResponseSchema, // Erreur d'authentification
	403: ErrorResponseSchema, // Erreur CSRF
	404: ErrorResponseSchema, // Ressource non trouvée
	409: ErrorResponseSchema, // Conflit (par exemple, utilisateur déjà existant)
	422: ErrorResponseSchema, // Erreur de validation
	500: ErrorResponseSchema, // Erreur interne du serveur
	503: ErrorResponseSchema, // Service indisponible
}
// Schéma pour les Headers
export const HeadersSchema = Type.Object({
	'x-csrf-token': Type.String({ description: 'CSRF token' }),
	authorization: Type.Optional(Type.String({ format: 'bearer', description: 'Bearer token' })),
});

// Schéma pour les tokens JWT
export const TokenSchema = 	Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			})

export const AuthSchema = {
  // Schéma pour la récupération de tous les utilisateurs
  register: {
	description: "Endpoint pour l'enregistrement d'un nouvel utilisateur",
	tags: ["Auth"],
	summary: 'Registration endpoint',
	Headers: HeadersSchema,
	body: Type.Object({
		name: Type.String({
			minLength: 2,
			maxLength: 20,
			pattern: namePattern,
			description: "Nom de 2 à 20 caractères, lettres, chiffres, _ @ . - autorisés",
			examples: ["Sup3r-User_01", "Jean.Doe", "user@42"]
		}),
		email: Type.String({ format: 'email', examples: ["jack@mail.com"]}),
		password: Type.String(({
			minLength: 8,
			pattern: passwordPattern,
			description: "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial (* / + - = @ _)."
		})),
	  }/* , { additionalProperties: false } */),
	response: {
		201: TokenSchema,
			/* Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			}), */
		...AppErrorSchema
	},
  },
  // Schéma pour le login
  login: {
	description: "Endpoint pour la connexion d'un utilisateur",
	tags: ["Auth"],
	summary: 'Login endpoint',
	Headers: HeadersSchema,
	body: Type.Object({
		email: Type.String({ format: 'email', examples: ["jack@mail.com"]}),
		password: Type.String(({
			minLength: 8,
			pattern: passwordPattern,
			description: "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial (* / + - = @ _)."
		})),
	  }),
	response: {
		200: Type.Array(
			Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			})
		),
		...AppErrorSchema
	},
  },

  profileMe: {
	description: "Endpoint pour obtenir les informations du profil de l'utilisateur connecté",
	tags: ["Auth"],
	summary: 'Get profile information',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	response: {
		200: Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["USER"] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			created_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
			updated_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
		}),
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

// Schéma pour les endpoints OAuth
oauthProvider: {
	tags: ["OAuth"],
    description: "OAuth endpoint for redirecting to the provider's authentication page",
	summary: 'OAuth provider endpoint',
    response: {
      302: Type.Object({
        location: Type.String({ examples: ["https://<oauth_provider.com>/o/oauth2/auth"] }),
      }),
    },
  },

  oauthCallback: {
	tags: ["OAuth"],
    description: "OAuth callback endpoint for handling the provider's response",
	summary: 'OAuth callback endpoint',
/* 	params: Type.Object({
		code: Type.Optional(Type.String({ examples: ["4%2F0AQSTgQH9xATzVDdeBCqEkf1efe-xiqzB9eE_v0NJXJHBxi_iIw3metIt-OMI85oWtYQ_LQ"] })),
		scope: Type.Optional(Type.String({ examples: ["email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email"] })),
		authuser: Type.Optional(Type.Number({ examples: [0] })),
		prompt: Type.Optional(Type.String({ examples: ["none"] })),
	}), */
	Cookies: Type.Object({
		__session: Type.String({ examples: ["eyJhb.eyJpZCI.1"] }),
	}),
    response: {
      200: Type.Object({
		  user: Type.Object({
				id: Type.Number(),
		  }),
		  token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1"] }),
 		}),
      401: Type.Object({
        message: Type.String({ examples: ["Invalid credentials"] }),
      }),
    },
  },
  // Schéma pour le reset du mot de passe
  loginForgetPassword: {
	description: "Endpoint pour la demande de réinitialisation du mot de passe",
	tags: ["Auth"],
	summary: 'Forgot password endpoint',
	Headers: HeadersSchema,
	body: Type.Object({
		email: Type.String({ format: 'email', examples: ["jack@mail.com"]}),
	  }),
	response: {
		201: 
			Type.Object({
				twoFactorRequired: Type.Boolean({ examples: [true, false] }),
				method: Type.String({ examples: ["email", "sms"] }),				
			}),		
		...AppErrorSchema
	},
  },
  // Schéma pour la verification du code de 2FA
  verify2FA: {
	description: "Endpoint pour la vérification du code de 2FA",
	tags: ["Auth", "2FA"],
	summary: 'Verify 2FA code endpoint',
	Headers: HeadersSchema,
	body: Type.Object({
		code: Type.String({
			minLength: 6,
			maxLength: 6,
			description: "Code de 2FA à 6 chiffres",
			examples: ["123456", "654321"],
		}),
		isforce: Type.Optional(Type.Boolean({ default: false, description: "Forcer la vérification du code de 2FA même si l'utilisateur n'a pas activé 2FA" })),
	  }),
	response: {
		201: 
			Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			}),
		...AppErrorSchema
	},
  },

    // Schéma pour le reset du mot de passe
  loginResetPassword: {
	description: "Endpoint pour la réinitialisation du mot de passe",
	tags: ["Auth"],
	summary: 'Reset password endpoint',
	Headers: HeadersSchema,
	body: Type.Object({
		password: Type.String(({
			minLength: 8,
			pattern: passwordPattern,
			description: "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial (* / + - = @ _)."
		})),
	  }),
	response: {
		200: 
			Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
				message: Type.String({ examples: ["Password changed successfully"] }),				
			}),
		...AppErrorSchema
	},
  },

  // Schéma pour la modification du mot de passe
  updateMePassword: {
	description: "Endpoint pour la modification du mot de passe de l'utilisateur connecté",
	tags: ["Auth"],
	summary: 'Update user password endpoint',
	headers: Type.Object({
		'x-csrf-token': Type.String({ description: 'CSRF token' }),
		}),
	body: Type.Object({
		oldPassword: Type.String(({
			minLength: 8,
			pattern: passwordPattern,
			description: "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial (* / + - = @ _)."
		})),
		newPassword: Type.String(({
			minLength: 8,
			pattern: passwordPattern,
			description: "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial (* / + - = @ _)."
		})),
	  }),
	response: {
		204: Type.Null(),
		...AppErrorSchema
	},
  },
};
