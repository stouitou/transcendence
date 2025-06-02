
import { Type } from '@sinclair/typebox';
export const usersStatsSchema =  Type.Optional(Type.Object({
				id: Type.Number(),
				classic_total_game_played: Type.Number({ examples: [0] }),
				classic_total_game_won: Type.Number({ examples: [0] }),
				classic_total_game_lost: Type.Number({ examples: [0] }),
				classic_total_game_draw: Type.Number({ examples: [0] }),
				classic_local_game_played: Type.Number({ examples: [0] }),
				classic_local_game_won: Type.Number({ examples: [0] }),
				classic_local_game_lost: Type.Number({ examples: [0] }),
				classic_local_game_draw: Type.Number({ examples: [0] }),
				classic_remote_game_played: Type.Number({ examples: [0] }),
				classic_remote_game_won: Type.Number({ examples: [0] }),
				classic_remote_game_lost: Type.Number({ examples: [0] }),
				classic_remote_game_draw: Type.Number({ examples: [0] }),
				tournament_total_game_played: Type.Number({ examples: [0] }),
				tournament_total_game_won: Type.Number({ examples: [0] }),
				tournament_total_game_lost: Type.Number({ examples: [0] }),
				tournament_total_game_draw: Type.Number({ examples: [0] }),
				tournament_local_game_played: Type.Number({ examples: [0] }),
				tournament_local_game_won: Type.Number({ examples: [0] }),
				tournament_local_game_lost: Type.Number({ examples: [0] }),
				tournament_local_game_draw: Type.Number({ examples: [0] }),
				tournament_remote_game_played: Type.Number({ examples: [0] }),
				tournament_remote_game_won: Type.Number({ examples: [0] }),
				tournament_remote_game_lost: Type.Number({ examples: [0] }),
				tournament_remote_game_draw: Type.Number({ examples: [0] }),
			}))

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
// Schéma pour les meta 
export const MetaSchema = 	Type.Object({
				total: Type.Number({ description: "Nombre total d'éléments", examples: [100] }),
				limit: Type.Number({ description: "Limite de résultats par page", examples: [10] }),
				offset: Type.Number({ description: "Décalage pour la pagination", examples: [0] }),
				order: Type.Optional(Type.String({ description: "Ordre de tri des résultats", examples: ["ASC", "DESC"] })),
				relations: Type.Optional(Type.Any({ description: "Relations à inclure dans la réponse", examples: ["players", "tournaments"] })),
				//relations: Type.Optional(Type.Array(Type.String({ description: "Relations à inclure dans la réponse", examples: ["players", "tournaments"] }))),
			})

export const GameSchema = Type.Optional(Type.Object({
	id: Type.Number({ description: "ID du jeu", examples: [1] }),
	gameHistory: Type.Optional(
		Type.Object({
			id: Type.Number({ description: "ID de l'historique du jeu", examples: [1] }),
			created_at: Type.String({ format: 'date-time', description: "Date de création de l'historique du jeu", examples: ["2021-08-17T09:00:00.000Z"] }),
			updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour de l'historique du jeu", examples: ["2021-08-17T09:00:00.000Z"] }),
			type: Type.String({ description: "Type de l'historique du jeu", examples: ["classic", "tournament"] }),
			format: Type.String({ description: "Format du jeu", examples: ["local", "remote"] }),
			 players: Type.Optional(Type.Array(
				Type.Object({
					id: Type.Number({ description: "ID du joueur", examples: [1] }),
					type: Type.String({ description: "Type de joueur", examples: ["local", "remote"] }),
					avatar: Type.Optional(Type.String({ description: "Avatar du joueur", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
					display_name: Type.String({ description: "Nom du joueur", examples: ["Player1"] }),
					score: Type.Optional(Type.Number({ description: "Score du joueur", examples: [100] })),
					is_IA: Type.Optional(Type.Boolean({ description: "Indique si le joueur est une IA", examples: [false] })),
					user: Type.Optional(Type.Object({
						id: Type.Number({ description: "ID de l'utilisateur", examples: [1] }),
						name: Type.String({ description: "Nom de l'utilisateur", examples: ["User1"] }),
						role: Type.Optional(Type.String({ description: "Rôle de l'utilisateur", examples: ["user", "admin"] })),
						level: Type.Optional(Type.Number({ description: "Niveau de l'utilisateur", examples: [1] })),
						avatar: Type.Optional(Type.String({ description: "Avatar de l'utilisateur", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
						created_at: Type.String({ format: 'date-time', description: "Date de création de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
						updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
						userStats: Type.Optional(usersStatsSchema),
					})),
				})),
			),
			winner: Type.Optional(Type.String({ description: "nom du joueur gagnant", examples: ["player_1"] })),

		}),
	),
	difficulty: Type.Number({ description: "Difficulté du jeu", examples: [1, 2, 3] }),
	max_players: Type.Number({ description: "Nombre maximum de joueurs", examples: [4] }),
	state: Type.String({ description: "État du jeu", examples: ["waiting", "playing", "finished"] }),
	players: Type.Optional(Type.Array(
		Type.Object({
			id: Type.Number({ description: "ID du joueur", examples: [1] }),
			name: Type.String({ description: "Nom du joueur", examples: ["Player1"] }),
			avatar: Type.Optional(Type.String({ description: "Avatar du joueur", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			role: Type.Optional(Type.String({ description: "Rôle du joueur", examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ description: "Niveau du joueur", examples: [1] })),
			userStats: Type.Optional(usersStatsSchema),
			created_at: Type.String({ description: "Date de création du joueur", examples: ["2021-08-17T09:00:00.000Z"] }),
			updated_at: Type.String({ description: "Date de mise à jour du joueur", examples: ["2021-08-17T09:00:00.000Z"] }),
		})),
	),
	current_round: Type.Optional(Type.Number({ description: "Numéro de la ronde en cours", examples: [1] })),
	created_at: Type.String({ format: 'date-time', description: "Date de création du jeu", examples: ["2021-08-17T09:00:00.000Z"] }),
	updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour du jeu", examples: ["2021-08-17T09:00:00.000Z"] }),
	type: Type.String({ description: "Type de jeu", examples: ["local", "remote"] }),
	format: Type.String({ description: "Format du jeu", examples: ["classic", "tournament"] }),

}));

export const TournamentSchema = Type.Optional(Type.Object({
	id: Type.Number({ description: "ID du tournoi", examples: [1] }),
	current_round: Type.Optional(Type.Number({ description: "Numéro du round en cours", examples: [1] })),
	games: Type.Optional(Type.Array(GameSchema)),
	state: Type.String({ description: "État du tournoi", examples: ["waiting", "playing", "finished", "created"] }),
	max_players: Type.Number({ description: "Nombre maximum de joueurs", examples: [4, 8, 16] }),
	winner: Type.Optional(Type.Object({
		id: Type.Number({ description: "ID du joueur gagnant", examples: [1] }),
		type: Type.String({ description: "Type de joueur", examples: ["local", "remote"] }),
		avatar: Type.Optional(Type.String({ description: "Avatar du joueur gagnant", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
		display_name: Type.String({ description: "Nom du joueur gagnant", examples: ["Player1"] }),
		score: Type.Optional(Type.Number({ description: "Score du joueur gagnant", examples: [100] })),
		user: Type.Optional(Type.Object({
			id: Type.Number({ description: "ID de l'utilisateur", examples: [1] }),
			name: Type.String({ description: "Nom de l'utilisateur", examples: ["User1"] }),
			role: Type.Optional(Type.String({ description: "Rôle de l'utilisateur", examples: ["user", "admin"] })),
			level: Type.Optional(Type.Number({ description: "Niveau de l'utilisateur", examples: [1] })),
			avatar: Type.Optional(Type.String({ description: "Avatar de l'utilisateur", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
			created_at: Type.String({ format: 'date-time', description: "Date de création de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
			updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
			userStats: Type.Optional(usersStatsSchema),
		})),
	})),
	type: Type.String({ description: "Type de tournoi", examples: ["local", "remote"] }),
	created_at: Type.String({ format: 'date-time', description: "Date de création du tournoi", examples: ["2021-08-17T09:00:00.000Z"] }),
	updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour du tournoi", examples: ["2021-08-17T09:00:00.000Z"] }),
}));

export const UsersSchema = Type.Optional(Type.Object({
	id: Type.Number({ description: "ID de l'utilisateur", examples: [1] }),
	name: Type.String({ description: "Nom de l'utilisateur", examples: ["User1"] }),
	role: Type.Optional(Type.String({ description: "Rôle de l'utilisateur", examples: ["user", "admin"] })),
	level: Type.Optional(Type.Number({ description: "Niveau de l'utilisateur", examples: [1] })),
	avatar: Type.Optional(Type.String({ description: "Avatar de l'utilisateur", examples: ["https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"] })),
	created_at: Type.String({ format: 'date-time', description: "Date de création de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
	updated_at: Type.String({ format: 'date-time', description: "Date de mise à jour de l'utilisateur", examples: ["2021-08-17T09:00:00.000Z"] }),
	userStats: Type.Optional(usersStatsSchema),
}));
