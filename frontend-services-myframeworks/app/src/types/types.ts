export interface Game {
    id: number;
    gameHistory: GameHistory | null;
    difficulty: number;
	max_players: number;
    state: string;
	players?: User[];
	currentRound: number;
	tournament?: Tournaments | null;
    created_at: string;
    type: string;
    format: string;
}

export interface UserStats {
	id: number;
	classic_total_game_played: number;
	classic_total_game_won: number;
	classic_total_game_lost: number;
	classic_total_game_draw: number;
	classic_local_game_played: number;
	classic_local_game_won: number;
	classic_local_game_lost: number;
	classic_local_game_draw: number;
	classic_remote_game_played: number;
	classic_remote_game_won: number;
	classic_remote_game_lost: number;
	classic_remote_game_draw: number;

	tournament_total_game_played: number;
	tournament_total_game_won: number;
	tournament_total_game_lost: number;
	tournament_total_game_draw: number;
	tournament_local_game_played: number;
	tournament_local_game_won: number;
	tournament_local_game_lost: number;
	tournament_local_game_draw: number;
	tournament_remote_game_played: number;
	tournament_remote_game_won: number;
	tournament_remote_game_lost: number;
	tournament_remote_game_draw: number;
}
/* export interface User {
    id: number;
    name: string;
    avatar: string;
    role: string;
    games: Game[] | null;
    tournaments: Tournaments[] | null;
    created_at: string;
    updated_at: string;
   userStats?: UserStats;
} */
/* export interface Tournaments {
	id: number;
	games?: Game[];
	state?: string;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	rounds?: Round[];
	currentRound?: number;
	winner: User | number|null;
} */
export interface Round {
	id: number;
	games: Game[];
	state: string;
	players?: User[] | number[];
	created_at: Date;
	updated_at: Date;
	tournaments?: Partial<Tournaments>[];
	current: number;
}
export interface User {id: number;
	name?: string;
	avatar?: string;
	password?: string;
	created_at: Date;
	updated_at: Date;
	role: string;
	level?: number;
	tournaments?: Tournaments[];
	games?: Game[];
   userStats?: UserStats;
}

export interface GameHistory {
	id: number;
	game: Game;
	created_at: Date;
	updated_at: Date;
	players?: Players[];
	winner?: string;
}

export interface Players {
	id?: number;
	gameHistory?: GameHistory[];
	type?: string;
	avatar?: string;
	display_name?: string;
	score?: number;
	is_IA?: boolean;
	user?: User | number | null;
	created_at?: Date;
	updated_at?: Date;
}
export interface Tournaments {
	id: number;
	currentRound?: number;
	games?: Game[];
	state?: string;
	max_players?: number;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	winner?: Players | number;
}