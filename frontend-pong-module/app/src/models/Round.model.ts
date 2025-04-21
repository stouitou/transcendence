import { Game } from "./Game.model";
import { Tournaments } from "./Tournaments.model";
import { User } from "./User.model";

export interface Round {
	id: number;
	games?: Game[];
	state?: string;
	current: number;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	tournaments?: Tournaments[];
}
