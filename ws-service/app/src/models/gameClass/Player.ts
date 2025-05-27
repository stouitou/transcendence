import { Direction } from "../../types/gameUtils.type";
import { Paddle } from "./Paddle";
import { WaitingPlayers } from "../../services/ws.service";
import { Bot } from "./Bot";

const directions:Direction[] = ['left', 'right', 'top', 'bottom'];
export class Player {
	id: number; // peut être "local", "remote-1", etc.
	userId: number = -1;
	name: string = 'host';
	isRemote: boolean = false;
	avatar: string = '/uploads/1-avatartest.jpg';
	state: string = 'waiting'; // "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled"
	isIA: boolean = false;
	isInGame: boolean = false;
	paddle: Paddle;
	direction: Direction;
	score: number = 0;
	position: {x:number,y:number} = { x: 0, y: 0 };
	initialPosition:{x:number,y:number}[] = [{ x: 775, y: 250 }, { x: 5, y: 250 }, { x: 450, y: 575 }, { x: 450, y: 5 }];
	sizes:{ width: number, height: number }[] = [{ width: 20, height: 100 }, { width: 20, height: 100 }, { width: 100, height: 20 }, { width: 100, height: 20 }];
	size:{ width: number, height: number }
	index: number = 0;

	bot:Bot|null = null; // Bot instance if the player is a bot
	directionReceived: 'up'|'down'|'left'|'right'|null = null;

	constructor(jsonData: WaitingPlayers, index: number = 0,difficulty: number = 1) {
		/**
		 * 
				userId: 'User-3',
				id: 3,
				name: 'IA-4',
				avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
				state: 'subscribe',
				isInGame: false,
				isIA: true,
				position: [Object],
				size: [Object],
				score: 0
		 */
		this.index = index;
		this.size =this.sizes[index]
		this.position = this.initialPosition[index];//@TODO doublon
		this.paddle = new Paddle(this.position, this.size);
		this.direction = directions[index];
			this.id = jsonData.id??-1;
			this.userId = jsonData.userId?? -1;
			this.name = jsonData.name?? 'guest';//@TODO
			//this.isRemote = jsonData.isRemote;
			this.avatar = jsonData.avatar?? '/uploads/1-avatartest.jpg';
			this.isIA = jsonData.isIA;
			this.isInGame = this.isIA?true:jsonData.isInGame;
			this.score = jsonData.score?? 0;
		//add bot if isIA
		if (this.isIA) {
			this.bot = new Bot(difficulty, this);
		}
			
	}
	toJSON(): any { //@BUG 
		return {
			id: this.id,
			userId: this.userId,
			name: this.name,
			avatar: this.avatar,
			state: this.state,
			isInGame: this.isInGame,
			isIA: this.isIA,
			position: this.position,
			size: this.size,
			score: this.score
		};
	}
}