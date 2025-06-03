
import { playerAction } from "../../types/gameUtils.type";
import { Player } from "../gameClass/Player";

export class	GameMovementManager {

	constructor (private canvas: { width: number; height: number }) { }

	updatePlayerMovements (players: Player[], actions: playerAction[]): void {
		players.forEach((player, index) => {
			const action = actions[index];
			if (action) {
				const	movement = this.getMovement(action);
				player.paddle.move(movement.dx, movement.dy);
			}
		});
	}

	private getMovement (action: playerAction): { dx: number; dy: number } {
		const	mappings = {
			up: { dx: 0, dy: -3 },
			down: { dx: 0, dy: 3 },
			left: { dx: -3, dy: 0 },
			right: { dx: 3, dy: 0 },
	  	};
		if (!action)	{ return { dx: 0, dy: 0 } ; }
		return mappings[action] ;
	}
  }