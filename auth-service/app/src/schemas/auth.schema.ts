import { Type } from '@sinclair/typebox';
//@TODO : Ajouter les schémas pour les endpoints pour le refresh token
//ex: POST /refresh-token
//ex: POST /logout

export const AuthSchema = {
  // Schéma pour la récupération de tous les utilisateurs
  register: {
	body: Type.Object({
		email: Type.String({ format: 'email', examples: ["jack@mail.com"]}),
		password: Type.String(({ minLength: 8 }))
	  }),
	response: {
		201: 
			Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			}),
		
		404: Type.Object({
			message: Type.String({ examples: ["User already exists"] }),
		}),
		500: Type.Object({
			message: Type.String({ examples: ["Internal Server Error"] }),
		}),
	},
  },
  // Schéma pour le login
  login: {
	body: Type.Object({
		email: Type.String({ format: 'email', examples: ["jack@mail.com"]}),
		password: Type.String(({ minLength: 8 }))
	  }),
	response: {
		200: Type.Array(
			Type.Object({
				token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
			})
		),
		401: Type.Object({
			message: Type.String({ examples: ["Invalid credentials"] }),
		}),
		500: Type.Object({
			message: Type.String({ examples: ["Internal Server Error"] }),
		}),
	},
  },

  profileMe: {
	Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	response: {
		200: Type.Object({
			id: Type.Number(),
			name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
			//email: Type.Optional(Type.String({ examples: ["jeandelaroche@publicis.fr"] })),
			role: Type.Optional(Type.String({ examples: ["USER"] })),
			avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			created_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
			updated_at: Type.String(/* { format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] } */),
		}),
		401: Type.Object({
			message: Type.String({ examples: ["No token provided"] }),
		}),
	},
	security: [{ bearerAuth: [] }],
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
		//	name: Type.Optional(Type.String({ examples: ["Sup€rKaRoT"] })),
		//	email: Type.Optional(Type.String({ examples: ["jeandelaroche@publicis.fr"] })),
		//	role: Type.Optional(Type.String({ examples: ["USER"] })),
		//	avatar: Type.Optional(Type.String({ examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
		//	createdAt: Type.String({ format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] }),
		//	updatedAt: Type.String({ format: 'date-time', examples: ["2021-08-17T09:00:00.000Z"] }),
        //token: Type.String({ format: 'jwt', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1"] }),
      }),
      401: Type.Object({
        message: Type.String({ examples: ["Invalid credentials"] }),
      }),
    },
  },
};
