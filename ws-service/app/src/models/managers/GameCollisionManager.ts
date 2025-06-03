import { Paddle } from "../../models/gameClass/Paddle";
import { Player } from "../../models/gameClass/Player";
import { GameBallManager } from "./GameBallManager";

export class	GameCollisionManager {

	private	ballManager: GameBallManager;
  
	constructor (private _canvas: { width: number; height: number }, ballManager: GameBallManager) {
	 /*  this.ball = new Ball(
		{ x: _canvas.width / 2, y: _canvas.height / 2 },
		{ width: 10, height: 10 },
		{ x: 1, y: 1 }
	  ); */
		this.ballManager = ballManager;
	}

	get canvas ()	{ return this._canvas ; }

	handleCollisions (players: Player[]) {
		this.checkWallCollision(players.length);
		this.checkPaddleCollision(players);
	}

	// checkCollisions (players: Player[]): void {
	// 	for (const player of players) {
	// 		if (this.hasCollision(player.paddle)) {
	// 			this.handleBallBounce(player);
	// 		}
	// 	}
	// 	const wallIndex = this.checkWallCollisions();
	// 	this.updateScore(wallIndex,players);
	// }

	private checkWallCollision (nbOfPlayers: number) {
		if (this.ballManager.ball.position.x + this.ballManager.ball.size.width >= this._canvas.width) {
			this.ballManager.ball.lastWallBounce = 0;
			if (this.ballManager.ball.lastHit && this.ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this.ballManager.ball.velocity.x *= -1;	// reverse horizontal direction
			this.ballManager.ball.position = {x: this.ballManager.ball.position.x + this.ballManager.ball.velocity.x * this.ballManager.ball.size.width, y: this.ballManager.ball.position.y + this.ballManager.ball.velocity.y * this.ballManager.ball.size.height};
			return ;
		}
		if (this.ballManager.ball.position.x <= (0 + this.ballManager.ball.size.width)) {
			this.ballManager.ball.lastWallBounce = 1;
			if (this.ballManager.ball.lastHit && this.ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this.ballManager.ball.velocity.x *= -1;	// reverse horizontal direction
			this.ballManager.ball.position = {x: this.ballManager.ball.position.x + this.ballManager.ball.velocity.x * this.ballManager.ball.size.width, y: this.ballManager.ball.position.y + this.ballManager.ball.velocity.y * this.ballManager.ball.size.height};
			return ;
		}
		if ((this.ballManager.ball.position.y + this.ballManager.ball.size.height) >= this._canvas.height) {
			this.ballManager.ball.lastWallBounce = 2;
			if (this.ballManager.ball.lastHit && this.ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this.ballManager.ball.velocity.y *= -1;	// reverse vertical direction
			this.ballManager.ball.position = {x: this.ballManager.ball.position.x + this.ballManager.ball.velocity.x * this.ballManager.ball.size.width, y: this.ballManager.ball.position.y + this.ballManager.ball.velocity.y * this.ballManager.ball.size.height};
			return ;
		}
		if (this.ballManager.ball.position.y <= (0 + this.ballManager.ball.size.height)) {
			this.ballManager.ball.lastWallBounce = 3;
			if (this.ballManager.ball.lastHit && this.ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this.ballManager.ball.velocity.y *= -1;	// reverse vertical direction
			this.ballManager.ball.position = {x: this.ballManager.ball.position.x + this.ballManager.ball.velocity.x * this.ballManager.ball.size.width, y: this.ballManager.ball.position.y + this.ballManager.ball.velocity.y * this.ballManager.ball.size.height};
			return ;
		}
	}

	private checkPaddleCollision (players: Player[]) {
		players.forEach(player => {
			const	paddle = player.paddle;
			if (paddle && this.isCollidingWithPaddle(paddle)) {
				this.bounceOffPaddle(paddle);
			}
		});
	}

	private isCollidingWithPaddle (paddle: Paddle) : boolean {
		return (
			this.ballManager.ball.position.x - this.ballManager.ball.size.width < paddle.position.x + paddle.size.width &&
			this.ballManager.ball.position.x + this.ballManager.ball.size.width > paddle.position.x &&
			this.ballManager.ball.position.y - this.ballManager.ball.size.height < paddle.position.y + paddle.size.height &&
			this.ballManager.ball.position.y + this.ballManager.ball.size.height > paddle.position.y
		);
	}

	private bounceOffPaddle (paddle: Paddle) {
		const	side = this.getSideCollision(paddle);

		let	impactRatio = 0;
		if (side === 'left' || side === 'right') {
			impactRatio = (this.ballManager.ball.position.y - (paddle.position.y + paddle.size.height / 2)) / (paddle.size.height / 2);
		}
		else if (side === 'top' || side === 'bottom') {
			impactRatio = ((this.ballManager.ball.position.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2));
		}
		impactRatio = Math.max(-0.9, Math.min(0.9, impactRatio));
		
		const	maxAngle = 60 * Math.PI / 180;
		const	angle = impactRatio * maxAngle;
		
		if (side === 'left' || side === 'right') {
			const	directionSign = (side === 'right') ? 1 : -1;
			this.ballManager.ball.velocity.x = Math.cos(angle) * directionSign;
			this.ballManager.ball.velocity.y = Math.sin(angle);
		}
		if (side === 'top' || side === 'bottom') {
			const	directionSign = (side === 'bottom') ? 1 : -1;
			this.ballManager.ball.velocity.x = Math.sin(angle);
			this.ballManager.ball.velocity.y = Math.cos(angle) * directionSign;
		}
		
		this.ballManager.ball.normalize();
		
		const	offset = this.ballManager.ball.size.width + 0.1;
		this.ballManager.ball.position.x += this.ballManager.ball.velocity.x * offset;
		this.ballManager.ball.position.y += this.ballManager.ball.velocity.y * offset;
	}

	private getSideCollision (paddle: Paddle) {
		const	dxLeft = Math.abs(this.ballManager.ball.position.x - paddle.position.x);
		const	dxRight = Math.abs(this.ballManager.ball.position.x - (paddle.position.x + paddle.size.width));
		const	dyTop = Math.abs(this.ballManager.ball.position.y - paddle.position.y);
		const	dyBottom = Math.abs(this.ballManager.ball.position.y - (paddle.position.y + paddle.size.height));

		const	possibleSides: { side: string, dist: number }[] = [];

		if (this.ballManager.ball.velocity.x > 0)	possibleSides.push({ side: 'left', dist: dxLeft });
		if (this.ballManager.ball.velocity.x < 0)	possibleSides.push({ side: 'right', dist: dxRight });
		if (this.ballManager.ball.velocity.y > 0)	possibleSides.push({ side: 'top', dist: dyTop });
		if (this.ballManager.ball.velocity.y < 0)	possibleSides.push({ side: 'bottom', dist: dyBottom });

		if (possibleSides.length === 0)	{ return 'left' ; }

		let	best = possibleSides[0];
		for (const side of possibleSides) {
			if (side.dist < best.dist)	{ best = side; }
		}
		return best.side ;
	}

	// private hasCollision (paddle: Paddle): boolean {
	// 	return this.ballManager.hasCollision(paddle);
	// 	/* return (
	// 		this.ball.position.x < paddle.position.x + paddle.size.width &&
	// 		this.ball.position.x + this.ball.size.width > paddle.position.x &&
	// 		this.ball.position.y < paddle.position.y + paddle.size.height &&
	// 		this.ball.position.y + this.ball.size.height > paddle.position.y
	// 	); */
	// }
  
	// private handleBallBounce(player: Player): void {
	// 	const playerIndex = player.index;
	// 	this.ballManager.handleBallBouncePlayer(playerIndex);
	//   // Inverser la vélocité selon le côté du paddle touché
	// 	/* if (playerIndex === 0 || playerIndex === 1) {
	// 		this.ball.velocity.x *= -1;
	// 	} else if (playerIndex === 2 || playerIndex === 3) {
	// 		this.ball.velocity.y *= -1;
	// 	} */
	// }
  
	// private checkWallCollisions(): number {
	// 	return this.ballManager.handleBallBounceWall();
	// }
  
	// /* getBall(): Ball {
	//   return this.ball;
	// } */

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