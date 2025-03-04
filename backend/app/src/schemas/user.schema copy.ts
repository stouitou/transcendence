import { z } from 'zod';


const userSchemaConstraints = {
  id: z.number(),
  name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional(),
  role: z.string().nullable().optional(),
};
export const UserSchema = {
	requestQuery: {
		body: z.object({
			name: z.string(),
			avatar: z.string(),
		  }),
		  response: {
			201: z.object({
				id: z.number(),
				name: z.string(),
				avatar: z.string(),
				created_at: z.string(),
				updated_at: z.string(),
				role: z.string(),
			}),
		  },
		},
  // Schéma pour la récupération de tous les utilisateurs
  getUsers: {
	response: {
		200: z.array(
			z.object({
				...userSchemaConstraints,
			})
		),
		404: z.object({
			message: z.string(),
		}),
	},
  },
  // Schéma pour la récupération d'un utilisateur par son ID
  getUserById: {
	params: z.object({
		id: z.string(),
	}),
	response: {
		200: z.object({
			...userSchemaConstraints,
		}),
		404: z.object({
			  message: z.string(),
		  }),
		417: z.object({
			message: z.string(),
		}),
	},
  },
  //  Schéma pour la création d'un utilisateur
  createUser: {
    body: z.object({
      name: z.string(),
    }),
    response: {
      201: z.object({
        ...userSchemaConstraints,
      }),
	  500: z.object({
		message: z.string(),
		cause: z.any(),

	  }),
    },
  },
  // Schéma pour la mise à jour d'un utilisateur
  updateUser: {
	params: z.object({
		id: z.string(),
	}),
	body: z.object({
		name: z.string(),
	}),
	response: {
		200: z.object({
			id: z.number(),
			name: z.string(),
		}),
		404: z.object({
			message: z.string(),
		}),
	},
  },
  // Schéma pour la suppression d'un utilisateur
  deleteUser: {
	params: z.object({
		id: z.string(),
	}),
	response: {
		200: z.object({
			message: z.string(),
		}),
		404: z.object({
			message: z.string(),
		}),
	},
  },
};
