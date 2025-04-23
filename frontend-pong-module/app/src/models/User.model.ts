import { Game } from "./Game.model";
import { Round } from "./Round.model";
import { Tournaments } from "./Tournaments.model";

export interface User {
	id?: number;
	name: string;
	role: string;
	level: number;
	avatar?: string;
	tournaments?: Tournaments[];
	rounds?: Round[];
	games?: Game[];
	friends?: User[];
	created_at?: Date;
	updated_at?: Date;
}