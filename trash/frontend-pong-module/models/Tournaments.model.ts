import { Round } from "./Round.model";
import { User } from "./User.model";

export interface Tournaments {
	id: number;
	currentRound?: number;
	rounds?: Round[];
	state?: string;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	winner?: User;
}