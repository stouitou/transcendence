import { Position } from "./Position.interface";
import { Size } from "./Size.interface";

export type DataMatch = {
	id: string,
	lobyId: string,
	players: {
		id: number;
		name: string;
		avatar: string;
		state: string;
		isInGame: boolean;
		isIA: boolean;
		position: Position;
		size: Size;
		score: number;
		paddle: {
			position: Position;
			size: Size;
		};
	}[],
	ball: {
		position: Position
	},
	config: {
		type: string;
		format: string;
		tournamentId: string | null;
		maxPlayers: number;
		isallowedRegistration: boolean;
		gameId: string;
		state: string;
		players: WaitingPlayers[];
	}
}

interface	WaitingPlayers {
	userId:		number,
	id:			number | null,
	name:		string | null,
	avatar:		string | null,
	state:		string | null,	// state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled"
	isInGame:	boolean,
	isIA:		boolean,
	position?: {
			x:	number,
			y:	number
		},
	size?:		Size,// taille du paddle
	score?:		number,
}
