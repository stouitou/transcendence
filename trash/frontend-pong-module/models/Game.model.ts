import { GameHistory } from "./GameHistory.model";
import { Round } from "./Round.model";
import { User } from "./User.model";

export interface Game {
	id: number;
	gameHistory?: GameHistory;
	difficulty: number;
	state: string;
	mode: string;
	players: User[];
	rounds?: Round[];
	created_at: Date;
	updated_at: Date;
}