
import { playerAction } from "../../types/gameUtils.type";
import { Player } from "../gameClass/Player";

export class GameMovementManager {
	constructor(private canvas: { width: number; height: number }) {}
  
	updatePlayerMovements(players: Player[], actions: playerAction[]): void {
	  players.forEach((player, index) => {
	//	console.log("updatePlayerMovements Player", index, "action:", actions[index]);
		const action = actions[index];
		if (action) {
	//		console.log("updatePlayerMovements Player", index, "action:", action);
		  const movement = this.getMovement(action);
	//		console.log("updatePlayerMovements movement", index, "action:", movement);

		  player.paddle.move(movement.dx, movement.dy);
		}
	  });
	}

/* 	updatePlayerAction = (playerIndex:number,action:playerAction) => {
		//check if is Allowed
				//check if is Allowed direction
		const allowedDirections = [["left", "right",null],["up", "down",null]];
		if (playerIndex > 1) {
			// Player 0 and 1 can only move left or right
			if (!allowedDirections[0].includes(action!)) {
				return;
			}
		} else {
			// Player 2 and 3 can only move up or down
			if (!allowedDirections[1].includes(action!)) {
				return;
			}
		}
		this.playersActions[playerIndex] = action;
	} */
  
	private getMovement(action: playerAction): { dx: number; dy: number } {
	  const mappings = {
		up: { dx: 0, dy: -5 },
		down: { dx: 0, dy: 5 },
		left: { dx: -5, dy: 0 },
		right: { dx: 5, dy: 0 },
	  };
	  if (!action) {
		return { dx: 0, dy: 0 };
	  }
	  return mappings[action];
	}
  }