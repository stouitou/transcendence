import { Type } from '@sinclair/typebox';


const userSchemaConstraints = {
  id: Type.Number(),
  name: Type.String(),
  avatar: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
  role: Type.String(),
};

const userSchemaDecodeToken = {
	id: Type.Number(),
	role: Type.String(),
	iat: Type.Number(),
	exp: Type.Number(),
  };
export const UserSchema = {
	isAdmin: {
		response: {
			200: Type.Object({
				isAdmin: Type.Boolean(),
			}),
		},
	},
	isUser: {
		response: {
			200: Type.Object({
				isUser: Type.Boolean(),
			}),
		},
	},
	requestQuery: {
			body: Type.Object({
				name: Type.String(),
				avatar: Type.String(),
			  }),
			  response: {
				201: Type.Object({
					id: Type.Number(),
					name: Type.String(),
					avatar: Type.String(),
					created_at: Type.String(),
					updated_at: Type.String(),
					role: Type.String(),
				}),
			  },
			},
	me: {
		response: {
			200: Type.Object({
				...userSchemaDecodeToken,
			}),
			404: Type.Object({
				message: Type.String(),
			}),
		},
	},
  // Schéma pour la récupération de tous les utilisateurs
  getUsers: {
	response: {
		200: Type.Array(
			Type.Object({
				...userSchemaConstraints,
				/* id: Type.Number(),
				name: Type.String(),
				email: Type.String(), */
			})
		),
		404: Type.Object({
			message: Type.String(),
		}),
	},
  },
  // Schéma pour la récupération d'un utilisateur par son ID
  getUserById: {
	params: Type.Object({
		id: Type.Number(),
	}),
	response: {
		200: Type.Object({
			...userSchemaConstraints,
		}),
		404: Type.Object({
			  message: Type.String(),
		  }),
		417: Type.Object({
			message: Type.String(),
		}),
	},
  },
  //  Schéma pour la création d'un utilisateur
  createUser: {
    body: Type.Object({
      name: Type.String(),
      
    }),
    response: {
      201: Type.Object({
        ...userSchemaConstraints
      }),
    },
  },
  // Schéma pour la mise à jour d'un utilisateur
	updateUser: {
	params: Type.Object({
		id: Type.String(),
	}),
	body: Type.Object({
		name: Type.String(),
	}),
	response: {
		200: Type.Any(),
		404: Type.Object({
			message: Type.String(),
		}),
	},
	},
	// Schéma pour la suppression d'un utilisateur
	deleteUser: {
	params: Type.Object({
		id: Type.String(),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		404: Type.Object({
			message: Type.String(),
		}),
	},
	},
	bebugResponse: {
		response: {
			200: Type.Object({
				message: Type.String(),
			}),
			404: Type.Object({
				message: Type.String(),
			}),
		}
	},
	uploadFile: {
		consumes: ['multipart/form-data'],
		formData: {
			title: 'uploadfile',
			type: 'file',
		},
	}
};
