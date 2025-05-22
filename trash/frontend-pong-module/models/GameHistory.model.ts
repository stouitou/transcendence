import { Game } from "./Game.model";

export interface GameHistory {
	id: number;
	score1: number;
	score2: number;
	player1: number;
	player2: number;
	game?: Game;
	created_at: Date;
	updated_at: Date;
}