

import { Paddle } from "../../models/gameClass/Paddle";
import { Player } from "../../models/gameClass/Player";
import { GameBallManager } from "./GameBallManager";
export class GameCollisionManager {
	//private ball: Ball;
	private ballManager: GameBallManager;
  
	constructor(private _canvas: { width: number; height: number },ballManager: GameBallManager) {
	 /*  this.ball = new Ball(
		{ x: _canvas.width / 2, y: _canvas.height / 2 },
		{ width: 10, height: 10 },
		{ x: 1, y: 1 }
	  ); */
		this.ballManager = ballManager;
	}
	get canvas() {
	  return this._canvas;
	}
  
	checkCollisions(players: Player[]/* , ball: Ball */): void {
	  for (const player of players) {
		if (this.hasCollision(player.paddle)) {
		  this.handleBallBounce(player);
		}
	  }
	 // this.checkWallCollisions();
	  //
	  const wallIndex = this.checkWallCollisions();
	  this.updateScore(wallIndex,players);
	}
  
	private hasCollision(paddle: Paddle): boolean {
		return this.ballManager.hasCollision(paddle);
		/* return (
			this.ball.position.x < paddle.position.x + paddle.size.width &&
			this.ball.position.x + this.ball.size.width > paddle.position.x &&
			this.ball.position.y < paddle.position.y + paddle.size.height &&
			this.ball.position.y + this.ball.size.height > paddle.position.y
		); */
	}
  
	private handleBallBounce(player: Player): void {
		const playerIndex = player.index;
		this.ballManager.handleBallBouncePlayer(playerIndex);
	  // Inverser la vélocité selon le côté du paddle touché
		/* if (playerIndex === 0 || playerIndex === 1) {
			this.ball.velocity.x *= -1;
		} else if (playerIndex === 2 || playerIndex === 3) {
			this.ball.velocity.y *= -1;
		} */
	}
  
	private checkWallCollisions(): number {
		return this.ballManager.handleBallBounceWall();
	}
  
	/* getBall(): Ball {
	  return this.ball;
	} */

	updateScore = (wallIndex:number,players: Player[])=>{
		const maxScore = 5; // Score maximum pour gagner //@TODO
		// Vérifier si la collision est valide
		if (wallIndex === -1) return; // Pas de collision avec un mur
		if (players.length <= wallIndex) return; // Pas de joueur pour ce mur
	
		let resetBall = false;
	
		// Parcourir les joueurs pour mettre à jour le score
		let score = 0;
		for (const [index, player] of players.entries()) { 
			if (index !== wallIndex) {
				if (player.score === undefined) {
					player.score = 0; // Initialiser le score à 0 si non défini
				}
				// Si ce n'est pas le joueur défendant le mur, incrémenter son score
				player.score++;
				if (score <= player.score) {
					score = player.score;
				}
				resetBall = true;
			 //   console.log(`id:${player.id} name:${player.name} score: ${player.score}`);
			}
		}
	
		// Réinitialiser la balle si un point a été marqué
		if (resetBall) {
			// Vérifier si le score maximum est atteint
			if (score >= maxScore) {
				this.setPlayersFinished(players);
				/* // les player passe en finished //@TODO a voir si neccessaire
				players.forEach((player) => {
						player.state = "finished";
						//player.isInGame = false;
				} 
				);*/
				
			}
		//	this.ball.reset({ x: this.canvas.width / 2, y: this.canvas.height / 2 },{ x: -this.ball.velocity.x, y: -this.ball.velocity.y });
			this.ballManager.resetBallPosition();
		}
	  }
	  private setPlayersFinished(players: Player[]): void {
		players.forEach((player) => {
		  player.state = "finished";
		});
	  }
  }