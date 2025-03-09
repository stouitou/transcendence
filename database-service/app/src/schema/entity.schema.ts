
import { Type } from '@sinclair/typebox';
import { request } from 'http';
import { title } from 'process';
import { array, optional } from 'zod';
//@TODO : Ajouter les schémas pour les endpoints pour le refresh token
//ex: POST /refresh-token
//ex: POST /logout

export const Schemas = {
	// Schéma pour la Création d'une entité
	createEntity: {
		description: 'Create entity',
		tags: ['Entity'],
		summary: 'Create entity',
		/* Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		security: [{ bearerAuth: [] }],*/
		params: {
			type: 'object',
			properties: {
			  database: { type: 'string', examples: ["myDb"] },
			  entity: { type: 'string', examples: ["User"] },
			},
			required: ['database', 'entity']
		  },
		body: {
			title: 'CreateEntity',
			type: 'object',
			additionalProperties: true,
			description: "valid JSON object",
			examples: [
				{
				  email: "example@example.com",
				  name: "John Doe",
				  age: 30
				}
			  ]

		},
		response: {
			200:Type.Object({
				success: Type.Boolean({ examples: [true] }),
				statusCode: Type.Number({ examples: [200] }),
				message: Type.String({ examples: ["OK"] }),
				data: Type.Any(),
				meta: Type.Object({
					limit: Type.Number({ examples: [1] }),
					offset: Type.Number({ examples: [0] }),
					order: Type.String({ examples: ["ASC"] }),
					relations: Type.String({ examples: ["[]"] }),
					total: Type.Number({ examples: [1] }),
				}),
			}),
	
	
			404: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [404] }),
				type: Type.String({ examples: ["NotFoundError"] }),
				message: Type.String({ examples: ["Entity 'User' with ID '1' not found"] }),
				code: Type.String({ examples: ["ID_NOT_FOUND"] }),// a revoir erreor code :ENTITY_NOT_FOUND ???
				//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
				//error: Type.String({ examples: ["Not Found"] }),
			}),
			400: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [400] }),
				type: Type.String({ examples: ["EntityPropertyNotFoundError"] }),
				message: Type.String({ examples: ["Propriété inconnue dans l'entité."] }),
				details: Type.String({ examples: ["Property \"authProvider\" was not found in \"User\". Make sure your query is correct."] }),
				//code: Type.String({ examples: ["INVALID_ID"] }), // @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
			}),
			500: Type.Any(),
		},
		querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			},
		},	
	  },
// Schéma pour la récupération de toutes les entités
	getEntitys: { // @TODO syntaxe à revoir getEntities
		description: 'Get entities with optional query parameters',
		tags: ['Entity'],
		summary: 'Get entities',
		/* Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		security: [{ bearerAuth: [] }],*/
		params: {
			type: 'object',
			properties: {
			  database: { type: 'string', examples: ["myDb"] },
			  entity: { type: 'string', examples: ["User"] },
			},
			required: ['database', 'entity']
		  },
		response: {
			//200:Type.Any(),
			200:Type.Object({
				success: Type.Boolean({ examples: [true] }),
				statusCode: Type.Number({ examples: [200] }),
				message: Type.String({ examples: ["OK"] }),
				data: Type.Any(),
				meta: Type.Object({
					limit: Type.Number({ examples: [1] }),
					offset: Type.Number({ examples: [0] }),
					order: Type.String({ examples: ["ASC"] }),
					relations: Type.String({ examples: ["[]"] }),
					total: Type.Number({ examples: [1] }),
				}),
			}),
	
	
			404: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [404] }),
				type: Type.String({ examples: ["NotFoundError"] }),
				message: Type.String({ examples: ["Entity 'User' with ID '1' not found"] }),
				code: Type.String({ examples: ["ID_NOT_FOUND"] }),// a revoir erreor code :ENTITY_NOT_FOUND ???
				//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
				//error: Type.String({ examples: ["Not Found"] }),
			}),
			400: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [400] }),
				type: Type.String({ examples: ["EntityPropertyNotFoundError"] }),
				message: Type.String({ examples: ["Propriété inconnue dans l'entité."] }),
				details: Type.String({ examples: ["Property \"authProvider\" was not found in \"User\". Make sure your query is correct."] }),
				//code: Type.String({ examples: ["INVALID_ID"] }), // @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
			}),
		},
		querystring: { // optional  querystring
			type: 'object',
			nullable: true,
			properties: {
			  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
			  limits : { type: 'number' },
			  offset : { type: 'number'},
			  order : { type: 'string', examples: ["","ASC","DESC"] },
			  filters: { type: 'array', description: 'filter for query clause where', items: { type: 'string' },examples: ['','{"id":"1"}','{"role":"user","id":"5" }']},
			  /* filters: Type.Array(Type.Object({}, { additionalProperties: true }), {
				description: 'Filter for query clause where',
				examples: [[{ id: "5" }, { role: "user" }]]
			  }), */
			},
		},
	  },
//      filters=[%7B%22id%22:%225%22%7D,%7B%22role%22:%22user%22%7D]
// User?filters=%7B%22id%22%3A%225%22%7D&filters=%7B%22role%22%3A%22user%22%7D"
	// Schéma pour la récupération d'une entité par son ID
	getEntityById: {
		description: 'Get entity by ID',
		tags: ['Entity'],
		summary: 'Get entity by ID',
		/* Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		security: [{ bearerAuth: [] }],*/
		params: {
			type: 'object',
			properties: {
			database: { type: 'string', examples: ["myDb"] },
			entity: { type: 'string', examples: ["User"] },
			id: { type: 'number', examples: [1] }
			},
			required: ['database', 'entity', 'id']
		},
		response: {
			//200:Type.Any(),
			200:Type.Object({
				success: Type.Boolean({ examples: [true] }),
				statusCode: Type.Number({ examples: [200] }),
				message: Type.String({ examples: ["OK"] }),
				data: Type.Any(),
				meta: Type.Object({
					limit: Type.Number({ examples: [1] }),
					offset: Type.Number({ examples: [0] }),
					order: Type.String({ examples: ["ASC"] }),
					relations: Type.String({ examples: ["[]"] }),
					total: Type.Number({ examples: [1] }),
				}),
			}),


			404: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [404] }),
				type: Type.String({ examples: ["NotFoundError"] }),
				message: Type.String({ examples: ["Entity 'User' with ID '1' not found"] }),
				code: Type.String({ examples: ["ID_NOT_FOUND"] }),// a revoir erreor code :ENTITY_NOT_FOUND ???
				//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
				//error: Type.String({ examples: ["Not Found"] }),
			}),
			400: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [400] }),
				type: Type.String({ examples: ["EntityPropertyNotFoundError"] }),
				message: Type.String({ examples: ["Propriété inconnue dans l'entité."] }),
				details: Type.String({ examples: ["Property \"authProvider\" was not found in \"User\". Make sure your query is correct."] }),
				//code: Type.String({ examples: ["INVALID_ID"] }), // @TODO a ajouter
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
			}),
		},
		querystring: { // optional  querystring
			type: 'object',
			properties: {
			relations: { type: 'array', examples: ["","authProviders"], },
			limits : { type: 'number'},
			offset : { type: 'number'},
			order : { type: 'string', examples: ["","ASC","DESC"] },
			}
		},
	},
  // Schéma pour la mise à jour d'une entité
  updateEntity: {
	description: 'Update entity by ID',
	tags: ['Entity'],
	summary: 'Update entity by ID',
	/* Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	security: [{ bearerAuth: [] }],*/
	params: {
		type: 'object',
		properties: {
		  database: { type: 'string', examples: ["myDb"] },
		  entity: { type: 'string', examples: ["User"] },
		  id: { type: 'number', examples: [1] }
		},
		required: ['database', 'entity', 'id']
	  },
	body: {
		type: 'object',
		additionalProperties: true,
		description: "valid JSON object",
		examples: [
			{
			  name: "Jane Doe",
			}
		  ],
		nullable: true
	},
	response: {
		200:Type.Object({
			success: Type.Boolean({ examples: [true] }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.String({ examples: ["OK"] }),
			data: Type.Any(),
			meta: Type.Object({
				limit: Type.Number({ examples: [1] }),
				offset: Type.Number({ examples: [0] }),
				order: Type.String({ examples: ["ASC"] }),
				relations: Type.String({ examples: ["[]"] }),
				total: Type.Number({ examples: [1] }),
			}),
		}),


		404: Type.Object({
			success: Type.Boolean({ examples: [false] }),
			statusCode: Type.Number({ examples: [404] }),
			type: Type.String({ examples: ["NotFoundError"] }),
			message: Type.String({ examples: ["Entity 'User' with ID '1' not found"] }),
			code: Type.String({ examples: ["ID_NOT_FOUND"] }),// a revoir erreor code :ENTITY_NOT_FOUND ???
			//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter
			timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
			//error: Type.String({ examples: ["Not Found"] }),
		}),
		400: Type.Object({
			success: Type.Boolean({ examples: [false] }),
			statusCode: Type.Number({ examples: [400] }),
			type: Type.String({ examples: ["EntityPropertyNotFoundError"] }),
			message: Type.String({ examples: ["Propriété inconnue dans l'entité."] }),
			details: Type.String({ examples: ["Property \"authProvider\" was not found in \"User\". Make sure your query is correct."] }),
			//code: Type.String({ examples: ["INVALID_ID"] }), // @TODO a ajouter
			timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
		}),
		500: Type.Any(),
	},
	querystring: { // optional  querystring
		type: 'object',
		nullable: true,
		properties: {
		  relations: { type: 'array', description: 'List of relations to include in the response', items: { type: 'string' },examples: ["","authProviders"]},
		  limits : { type: 'number' },
		  offset : { type: 'number'},
		  order : { type: 'string', examples: ["","ASC","DESC"] },
		},
	},	
  },
// Schéma pour la suppression d'une entité
  deleteEntity: {	
	description: 'Delete entity by ID',
	tags: ['Entity'],
	summary: 'Delete entity by ID',
	/* Headers: Type.Object({
		authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
	}),
	security: [{ bearerAuth: [] }],*/
	params: {
		type: 'object',
		properties: {
		  database: { type: 'string', examples: ["myDb"] },
		  entity: { type: 'string', examples: ["User"] },
		  id: { type: 'number', examples: [1] }
		},
		required: ['database', 'entity', 'id']
	  },
	response: {
		200: Type.Object({
			success: Type.Boolean({ examples: [true] }),
			statusCode: Type.Number({ examples: [200] }),
			message: Type.String({ examples: ["OK"] }),
			data: Type.Any(),
			meta: Type.Object({
				limit: Type.Number({ examples: [1] }),
				offset: Type.Number({ examples: [0] }),
				order: Type.String({ examples: ["ASC"] }),
				relations: Type.String({ examples: ["[]"] }),
				total: Type.Number({ examples: [1] }),
			}),
		}),


		404: Type.Object({
			success: Type.Boolean({ examples: [false] }),
			statusCode: Type.Number({ examples: [404] }),
			type: Type.String({ examples: ["NotFoundError"] }),
			message: Type.String({ examples: ["Entity 'User' with ID '1' not found"] }),
			code: Type.String({ examples: ["ID_NOT_FOUND"] }),// a revoir erreor code :ENTITY_NOT_FOUND ???
			//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter
			timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
			//error: Type.String({ examples: ["Not Found"] }),
		}),
		400: Type.Object({
			success: Type.Boolean({ examples: [false] }),
			statusCode: Type.Number({ examples: [400] }),
			type: Type.String({ examples: ["EntityPropertyNotFoundError"] }),
			message: Type.String({ examples: ["Propriété inconnue dans l'entité."] }),
			details: Type.String({ examples: ["Property \"authProvider\" was not found in \"User\". Make sure your query is correct."] }),
			//code: Type.String({ examples: ["INVALID_ID"] }), // @TODO a ajouter
			timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
		}),
		500: Type.Any(),
	},
  },

  // Schéma pour la récupération de la liste des bases de données
  getDatabases: {
		description: 'Get databases',
		tags: ['Database'],
		summary: 'Get databases',
		/* Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		security: [{ bearerAuth: [] }],*/
		response: {
			200:Type.Object({
				success: Type.Boolean({ examples: [true] }),
				statusCode: Type.Number({ examples: [200] }),
				message: Type.String({ examples: ["OK"] }),
				data: Type.Any(),
				meta: Type.Object({
					limit: Type.Number({ examples: [1] }),
					offset: Type.Number({ examples: [0] }),
					order: Type.String({ examples: ["ASC"] }),
					relations: Type.String({ examples: ["[]"] }),
					total: Type.Number({ examples: [1] }),
				}),
			}),
		},
	},
	default: {
		response: {
			200:Type.Any()
		}
	},

	// Schéma pour la récupération le la liste de toutes les entités d'une base de données
	getDatabaseEntitys: { // @TODO syntaxe à revoir ...Entities
		description: 'Get entities list',
		tags: ['Database'],
		summary: 'Get entities list',
		/* Headers: Type.Object({
			authorization: Type.String({ format: 'bearer', examples: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MzUwNzIyfQ.1" ]}),
		}),
		security: [{ bearerAuth: [] }],*/
		params: {
			type: 'object',
			properties: {
			  database: { type: 'string', examples: ["myDb"] },
			},
			required: ['database']
		  },
		response: {
			200:Type.Object({
				success: Type.Boolean({ examples: [true] }),
				statusCode: Type.Number({ examples: [200] }),
				message: Type.String({ examples: ["OK"] }),
				data: Type.Any(),
				meta: Type.Object({
					limit: Type.Number({ examples: [1] }),
					offset: Type.Number({ examples: [0] }),
					order: Type.String({ examples: ["ASC"] }),
					relations: Type.String({ examples: ["[]"] }),
					total: Type.Number({ examples: [1] }),
				}),
			}),
	
	
			404: Type.Object({
				success: Type.Boolean({ examples: [false] }),
				statusCode: Type.Number({ examples: [404] }),
				type: Type.String({ examples: ["DatabaseNotFoundError"] }),
				message: Type.String({ examples: ["Database notMyDb not found"] }),
				code: Type.String({ examples: ["DATABASE_NOT_FOUND"] }),
				//details: Type.String({ examples: ["@TODO"] }),// @TODO a ajouter?
				timestamp: Type.String({ examples: ["2021-08-25T14:15:22.000Z"] }),
				//error: Type.String({ examples: ["Not Found"] }),
			}),
		},		
	  },
};



/* export const getEntitiesSchema = {
	getAll : {
schema: {
	description: 'Get entities with optional query parameters',
	tags: ['Entity'],
	summary: 'Get entities',
	params: {
	  type: 'object',
	  properties: {
		database: { type: 'string' },
		entity: { type: 'string' }
	  },
	  required: ['database', 'entity']
	},
	querystring: {
	  type: 'object',
	  properties: {
		relations: { type: 'string' }
	  }
	}
  }
}, */