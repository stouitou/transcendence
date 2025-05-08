import { WaitingPlayers } from "../../services/ws.service";
import { gameLoop, playerAction } from "../../types/gameUtils.type";

export class GameLoopData {
	ball: {position:{x:number,y:number},size:{width:number,height:number}};
	players: WaitingPlayers[];
	playersActions: playerAction[];
	constructor(game: gameLoop) {
		this.ball = game.ball;
		this.players = game.players;
		this.playersActions = game.playersActions;
	}
}