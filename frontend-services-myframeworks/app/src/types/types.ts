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

//nombre de parties jouées
  total_game_played: number;
 //nombre de parties gagnées
  total_game_won: number;
 //nombre de parties perdues
  total_game_lost: number;
 //nombre de parties nulles
  total_game_draw: number;

 //nombre de parties jouées en local
  local_game_played: number;
 //nombre de parties gagnées en local
  local_game_won: number;
 //nombre de parties perdues en local
  local_game_lost: number;
 //nombre de parties nulles en local
  local_game_draw: number;

 //nombre de parties jouées en remote
  remote_game_played: number;
 //nombre de parties gagnées en remote
  remote_game_won: number;
 //nombre de parties perdues en remote
  remote_game_lost: number;
 //nombre de parties nulles en remote
  remote_game_draw: number;

 //nombre de parties jouées en tournoi
  tournament_game_played: number;
 //nombre de parties gagnées en tournoi
  tournament_game_won: number;
 //nombre de parties perdues en tournoi
  tournament_game_lost: number;
 //nombre de parties nulles en tournoi
  tournament_game_draw: number;

 //nombre de parties jouées en tournoi local
  tournament_local_game_played: number;
 //nombre de parties gagnées en tournoi local
  tournament_local_game_won: number;
 //nombre de parties perdues en tournoi local
  tournament_local_game_lost: number;
 //nombre de parties nulles en tournoi local
  tournament_local_game_draw: number;
  
 //nombre de parties jouées en tournoi remote
  tournament_remote_game_played: number;
 //nombre de parties gagnées en tournoi remote
  tournament_remote_game_won: number;
 //nombre de parties perdues en tournoi remote
  tournament_remote_game_lost: number;
 //nombre de parties nulles en tournoi remote
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