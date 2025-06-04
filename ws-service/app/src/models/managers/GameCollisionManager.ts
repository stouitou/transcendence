import { Paddle } from "../../models/gameClass/Paddle";
import { Player } from "../../models/gameClass/Player";
import { GameBallManager } from "./GameBallManager";

export class	GameCollisionManager {

	private	_ballManager: GameBallManager;
  
	constructor (private _canvas: { width: number; height: number }, ballManager: GameBallManager) {
	 /*  this.ball = new Ball(
		{ x: _canvas.width / 2, y: _canvas.height / 2 },
		{ width: 10, height: 10 },
		{ x: 1, y: 1 }
	  ); */
		this._ballManager = ballManager;
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
		if (this._ballManager.ball.position.x + this._ballManager.ball.size.width >= this._canvas.width) {
			this._ballManager.ball.lastWallBounce = 0;
			if (this._ballManager.ball.lastHit && this._ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this._ballManager.ball.velocity.x *= -1;	// reverse horizontal direction
			this._ballManager.ball.position = {x: this._ballManager.ball.position.x + this._ballManager.ball.velocity.x * this._ballManager.ball.size.width, y: this._ballManager.ball.position.y + this._ballManager.ball.velocity.y * this._ballManager.ball.size.height};
			return ;
		}
		if (this._ballManager.ball.position.x <= (0 + this._ballManager.ball.size.width)) {
			this._ballManager.ball.lastWallBounce = 1;
			if (this._ballManager.ball.lastHit && this._ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this._ballManager.ball.velocity.x *= -1;	// reverse horizontal direction
			this._ballManager.ball.position = {x: this._ballManager.ball.position.x + this._ballManager.ball.velocity.x * this._ballManager.ball.size.width, y: this._ballManager.ball.position.y + this._ballManager.ball.velocity.y * this._ballManager.ball.size.height};
			return ;
		}
		if ((this._ballManager.ball.position.y + this._ballManager.ball.size.height) >= this._canvas.height) {
			this._ballManager.ball.lastWallBounce = 2;
			if (this._ballManager.ball.lastHit && this._ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this._ballManager.ball.velocity.y *= -1;	// reverse vertical direction
			this._ballManager.ball.position = {x: this._ballManager.ball.position.x + this._ballManager.ball.velocity.x * this._ballManager.ball.size.width, y: this._ballManager.ball.position.y + this._ballManager.ball.velocity.y * this._ballManager.ball.size.height};
			return ;
		}
		if (this._ballManager.ball.position.y <= (0 + this._ballManager.ball.size.height)) {
			this._ballManager.ball.lastWallBounce = 3;
			if (this._ballManager.ball.lastHit && this._ballManager.ball.lastWallBounce < nbOfPlayers)	{ return ; }
			this._ballManager.ball.velocity.y *= -1;	// reverse vertical direction
			this._ballManager.ball.position = {x: this._ballManager.ball.position.x + this._ballManager.ball.velocity.x * this._ballManager.ball.size.width, y: this._ballManager.ball.position.y + this._ballManager.ball.velocity.y * this._ballManager.ball.size.height};
			return ;
		}
	}

	private checkPaddleCollision (players: Player[]) {
		players.forEach(player => {
			const	paddle = player.paddle;
			if (paddle && this.isCollidingWithPaddle(paddle)) {
				this._ballManager.ball.maxBounceCountRound++;
				player.history.bounceCount++;
				this._ballManager.ball.lastHit = player;
				this.bounceOffPaddle(paddle);
			}
		});
	}

	private isCollidingWithPaddle (paddle: Paddle) : boolean {
		return (
			this._ballManager.ball.position.x - this._ballManager.ball.size.width < paddle.position.x + paddle.size.width &&
			this._ballManager.ball.position.x + this._ballManager.ball.size.width > paddle.position.x &&
			this._ballManager.ball.position.y - this._ballManager.ball.size.height < paddle.position.y + paddle.size.height &&
			this._ballManager.ball.position.y + this._ballManager.ball.size.height > paddle.position.y
		);
	}

	private bounceOffPaddle (paddle: Paddle) {
		this._ballManager.ball.lastWallBounce = null;

		const	side = this.getSideCollision(paddle);

		let	impactRatio = 0;
		if (side === 'left' || side === 'right') {
			impactRatio = (this._ballManager.ball.position.y - (paddle.position.y + paddle.size.height / 2)) / (paddle.size.height / 2);
		}
		else if (side === 'top' || side === 'bottom') {
			impactRatio = ((this._ballManager.ball.position.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2));
		}
		impactRatio = Math.max(-0.9, Math.min(0.9, impactRatio));
		
		const	maxAngle = 60 * Math.PI / 180;
		const	angle = impactRatio * maxAngle;
		
		if (side === 'left' || side === 'right') {
			const	directionSign = (side === 'right') ? 1 : -1;
			this._ballManager.ball.velocity.x = Math.cos(angle) * directionSign;
			this._ballManager.ball.velocity.y = Math.sin(angle);
		}
		if (side === 'top' || side === 'bottom') {
			const	directionSign = (side === 'bottom') ? 1 : -1;
			this._ballManager.ball.velocity.x = Math.sin(angle);
			this._ballManager.ball.velocity.y = Math.cos(angle) * directionSign;
		}
		
		this._ballManager.ball.normalize();
		
		const	offset = this._ballManager.ball.size.width + 0.1;
		this._ballManager.ball.position.x += this._ballManager.ball.velocity.x * offset;
		this._ballManager.ball.position.y += this._ballManager.ball.velocity.y * offset;
	}

	private getSideCollision (paddle: Paddle) {
		const	dxLeft = Math.abs(this._ballManager.ball.position.x - paddle.position.x);
		const	dxRight = Math.abs(this._ballManager.ball.position.x - (paddle.position.x + paddle.size.width));
		const	dyTop = Math.abs(this._ballManager.ball.position.y - paddle.position.y);
		const	dyBottom = Math.abs(this._ballManager.ball.position.y - (paddle.position.y + paddle.size.height));

		const	possibleSides: { side: string, dist: number }[] = [];

		if (this._ballManager.ball.velocity.x > 0)	possibleSides.push({ side: 'left', dist: dxLeft });
		if (this._ballManager.ball.velocity.x < 0)	possibleSides.push({ side: 'right', dist: dxRight });
		if (this._ballManager.ball.velocity.y > 0)	possibleSides.push({ side: 'top', dist: dyTop });
		if (this._ballManager.ball.velocity.y < 0)	possibleSides.push({ side: 'bottom', dist: dyBottom });

		if (possibleSides.length === 0)	{ return 'left' ; }

		let	best = possibleSides[0];
		for (const side of possibleSides) {
			if (side.dist < best.dist)	{ best = side; }
		}
		return best.side ;
	}

	// private hasCollision (paddle: Paddle): boolean {
	// 	return this._ballManager.hasCollision(paddle);
	// 	/* return (
	// 		this.ball.position.x < paddle.position.x + paddle.size.width &&
	// 		this.ball.position.x + this.ball.size.width > paddle.position.x &&
	// 		this.ball.position.y < paddle.position.y + paddle.size.height &&
	// 		this.ball.position.y + this.ball.size.height > paddle.position.y
	// 	); */
	// }
  
	// private handleBallBounce(player: Player): void {
	// 	const playerIndex = player.index;
	// 	this._ballManager.handleBallBouncePlayer(playerIndex);
	//   // Inverser la vélocité selon le côté du paddle touché
	// 	/* if (playerIndex === 0 || playerIndex === 1) {
	// 		this.ball.velocity.x *= -1;
	// 	} else if (playerIndex === 2 || playerIndex === 3) {
	// 		this.ball.velocity.y *= -1;
	// 	} */
	// }
  
	// private checkWallCollisions(): number {
	// 	return this._ballManager.handleBallBounceWall();
	// }
  
	// /* getBall(): Ball {
	//   return this.ball;
	// } */

	updateScore = (wallIndex: number, players: Player[]) => {
		const	maxScore = 5; // Score maximum pour gagner //@TODO
		// Vérifier si la collision est valide
		// if (this._ballManager.ball.lastHit && this._ballManager.ball.lastWallBounce != null && this._ballManager.ball.lastWallBounce < players.length &&
		// 	(this._ballManager.ball.position.x + this._ballManager.ball.size.width < 0 ||
		// 	this._ballManager.ball.position.x > this._canvas.width ||
		// 	this._ballManager.ball.position.y + this._ballManager.ball.size.height < 0 ||
		// 	this._ballManager.ball.position.y > this._canvas.height)
		// ) {
		// 	let	score = 0;
		// 	if (players.length === 2) {
		// 		const	winnerIndex = this._ballManager.ball.lastWallBounce === 0 ? 1 : 0;
		// 		players[winnerIndex].score++;
		// 		score = players[winnerIndex].score;
		// 	} else {
		// 		if (this._ballManager.ball.lastHit.location === this._ballManager.ball.lastWallBounce && this._ballManager.ball.lastHit.score > 0)
		// 			this._ballManager.ball.lastHit.score--;
		// 		else if (this._ballManager.ball.lastHit.location != this._ballManager.ball.lastWallBounce) {
		// 			this._ballManager.ball.lastHit.score++;
		// 			score = this._ballManager.ball.lastHit.score;
		// 		}
		// 	}
		// 	players[this._ballManager.ball.lastWallBounce].history.goalsConceded++;
		// 	this._ballManager.ball.reset();

		// 	if (score >= maxScore) {
		// 		this.setPlayersFinished(players);
		// 	}
		// }

		if (wallIndex === -1)	{ return ; } // Pas de collision avec un mur
		if (players.length <= wallIndex)	{ return ; } // Pas de joueur pour ce mur
	
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
			this._ballManager.resetBallPosition();
		}
	}

	private setPlayersFinished (players: Player[]) : void {
		players.forEach((player) => {
			player.state = "finished";
		});
	}
  }