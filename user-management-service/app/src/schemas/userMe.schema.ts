import { Type } from '@sinclair/typebox';
import { AppErrorSchema, HeadersSchema, MetaSchema, namePattern, passwordPattern, TokenSchema, UsersSchema, usersStatsSchema } from './utils.schema';

export const UserMeSchema = {
  // Schéma pour la récupération de tous les utilisateurs
  register: {
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

  getUserMe: {
	description: 'Get the current user information',
	tags: ['User', 'Me'],
	summary: 'Get current user information',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	response: {
		200: Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			authProviders: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
					provider: Type.String({ examples: ["local", "google", "github", "facebook"] }),
					provider_id: Type.String({ examples: ["<provider_user_id>"] }),
					//password: Type.Optional(Type.String({ examples: ["$2b$10$elOD8Yk/OBsS2FVL0GHIB.vcEiqKtU3OxQFhX3CYopM6ujxDn1MCK"] })),
					two_factor_auth: Type.Boolean({ examples: [true, false] }),
					//two_factor_auth_secret: Type.Optional(Type.String({ examples: ["<two_factor_auth_secret>"] })),
					two_factor_auth_method: Type.String({ examples: ["email", "totp"] }),
					//otpExpiration: Type.Optional(Type.String({ format: 'date-time', examples: ["2025-05-30T09:56:16.682Z"] })),
					//otp: Type.Optional(Type.String({ examples: ["d4d16fa199df4a45a1a2b195:6a7e5f305f4f1fcbf7d78e770d73324d:"] })),
				})
			),),
			games: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
				})
			)),
			tournaments: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
				})
			)),
			friends: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
					name: Type.String({ examples: ["FriendName"] }),
					avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
				})
			)),
			userStats: usersStatsSchema,
			created_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
			updated_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
		}),
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

  // Schéma pour la mise à jour d'un utilisateur
  updateUserMe: { //mise a jour du nom
	description: 'Update the current user information (name)',
	tags: ['User', 'Me'],
	summary: 'Update current user information',
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
	}),
	response: {
		200:  Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			userStats: usersStatsSchema,
			created_at: Type.String(),
			updated_at: Type.String(),
		}),		
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },
  deleteUserMe: {
	description: 'Delete the current user account',
	tags: ['User', 'Me'],
	summary: 'Delete current user account',
	response: {
		200: Type.Any(), // Pas de contenu à retourner, juste un statut 200
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },


  getUserMeById:  {
	description: 'Get user information by ID',
	tags: ['User', 'Me'],
	summary: 'Get user information by ID',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	params: Type.Object({
		id: Type.String({ description: "ID de l'utilisateur à récupérer", examples: ["1"] }),
	}),
	response: {
		200:  Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			//userStats: usersStatsSchema,
			created_at: Type.String(),
			//updated_at: Type.String(),
		}),		
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

  getUserStatsById:  {
	description: 'Get user statistics by ID',
	tags: ['User', 'Me'],
	summary: 'Get user statistics by ID',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	params: Type.Object({
		id: Type.String({ description: "ID de l'utilisateur à récupérer", examples: ["1"] }),
	}),
	response: {
		200:  usersStatsSchema,
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

  addFriend:{ //ajouter un ami par id
	description: 'Add a friend by ID',
	tags: ['User', 'Me'],
	summary: 'Add a friend by ID',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	body: Type.Object({
		friendId: Type.String({ description: "ID de l'ami à ajouter", examples: ["1"] }),
	}),
	response: {
		200:  Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			userStats: usersStatsSchema,
			created_at: Type.String(),
			updated_at: Type.String(),
		}),		
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },
  addFriendByUserName:{ //ajouter un ami par id
	description: 'Add a friend by username',
	tags: ['User', 'Me'],
	summary: 'Add a friend by username',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	body: Type.Object({
		friendName: Type.String({ description: "Nom de l'ami à ajouter", examples: ["Jean.Doe"] }),
	}),
	response: {
		200:  Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			userStats: usersStatsSchema,
			created_at: Type.String(),
			updated_at: Type.String(),
			friends: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
					name: Type.Optional(Type.String({ examples: ["friendName"] })),
					role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
					level: Type.Optional(Type.Number({ examples: [1] })),
					avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
					userStats: usersStatsSchema,
					created_at: Type.String(),
					updated_at: Type.String(),
				})
			)),
		}),		
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },
  removeFriendById:{ //ajouter un ami par id
	description: 'Remove a friend by ID',
	tags: ['User', 'Me'],
	summary: 'Remove a friend by ID',
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	body: Type.Object({
		friendId: Type.String({ description: "ID de l'ami à supprimer", examples: ["1"] }),
	}),
	response: {
		200:  Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ examples: [1] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			userStats: usersStatsSchema,
			created_at: Type.String(),
			updated_at: Type.String(),
			friends: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number(),
					name: Type.Optional(Type.String({ examples: ["friendName"] })),
					role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
					level: Type.Optional(Type.Number({ examples: [1] })),
					avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
					userStats: usersStatsSchema,
					created_at: Type.String(),
					updated_at: Type.String(),
				})
			)),
		}),		
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },
  getUsersLeaderboard:  { //mise a jour du nom
	description: 'Get the 5 top users in the leaderboard',
	tags: ['User', 'Me'],
	summary: 'Get the 5 top users in the leaderboard',
	response: {
		
		200: Type.Array(
			Type.Object({
					id: Type.Number(),
					name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
					role: Type.Optional(Type.String({ examples: ["user", "admin"] })),
					level: Type.Optional(Type.Number({ examples: [1] })),
					avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
					userStats: usersStatsSchema,
					created_at: Type.String(),
					//updated_at: Type.String(),
				}),
			),
		...AppErrorSchema
	},
	security: [{ bearerAuth: [] }],
  },

  updateUserAvatar: {
		description: 'Update user avatar',
		tags: ['User', 'Me'],
		summary: 'Update user avatar',
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
  // Schéma pour la modification du mot de passe
  updateMePassword: {
	description: 'Update the current user password',
	tags: ['User', 'Me'],
	summary: 'Update current user password',
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


// Schéma pour les endpoints OAuth
oauthProvider: {
	tags: ["OAuth"],
    description: "OAuth endpoint for redirecting to the provider's authentication page",
    response: {
      302: Type.Object({
        location: Type.String({ examples: ["https://<oauth_provider.com>/o/oauth2/auth"] }),
      }),
    },
  },

  oauthCallback: {
	tags: ["OAuth"],
    description: "OAuth callback endpoint for handling the provider's response",
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

  get2FAStatus: {
	description: 'Get the 2FA status of the current user',
	tags: ['User', 'Me', '2FA'],
	summary: 'Get current user 2FA status',
	Headers: HeadersSchema,
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
  enable2FA: {
	description: 'Enable 2FA for the current user',
	tags: ['User', 'Me', '2FA'],
	summary: 'Enable 2FA for current user',
	Headers: HeadersSchema,
	body: Type.Object({
		method: Type.Optional(Type.String({ enum: ['email', 'totp'], default: 'email', description: 'Méthode d\'authentification à deux facteurs' })),
		enable: Type.Boolean({ default: true, description: 'Activer  l\'authentification à deux facteurs' }),
	}),
	response: {
		200: Type.Object({
			message: Type.String({ examples: ["2FA enabled successfully"] }),
		}),
		...AppErrorSchema
	},
  },
   disable2FA: {
	description: 'Disable 2FA for the current user',
	tags: ['User', 'Me', '2FA'],
	summary: 'Disable 2FA for current user',
	Headers: HeadersSchema,
	body: Type.Object({}),
	response: {
		200: Type.Object({
			message: Type.String({ examples: ["2FA disabled successfully"] }),
		}),
		...AppErrorSchema
	},
  },
  get2FAQRCode: {
	description: 'Get the 2FA QR code for the current user',
	tags: ['User', 'Me', '2FA'],
	summary: 'Get current user 2FA QR code',
	Headers: HeadersSchema,
	response: {
		200: Type.Object({
			  qrCode: Type.String({
				format: 'byte',
				description: "QR code PNG encodé en base64",
				examples: [
				"iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAIAAAC4z5kEAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAgAElEQVR4nOzdeXhU1f8H8M+Z..."
				]
			}),
		}),
		...AppErrorSchema
	},
 },
	  
};
