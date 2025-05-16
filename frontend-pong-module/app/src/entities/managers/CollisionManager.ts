import { Ball } from '../Ball';
import { Player } from '../Player';
import { Paddle } from '../Paddle';

export class CollisionManager {

	canvas = { width: 800, height: 600 };

	handleCollisions(ball: Ball, players: Player[]) {
		// Gérer les collisions avec les murs
		this.checkWallCollision(ball);

		// Gérer les collisions avec les paddles
		this.checkPaddleCollision(ball,players);
		//this.clampBall(canvas)
	//metre a jour le score
	//this.updateScore(ball);
	}

	updateScore(ball: Ball) {
		if (ball.lastHit && ball.lastWallBounce!=null) {
			ball.lastHit.score++;
			console.log('Score updated for player:', ball.lastHit.name, 'New score:', ball.lastHit.score);
			//	ball.lastHit = null; // Réinitialiser le dernier joueur ayant touché la balle
			//	ball.lastWallBounce = null; // Réinitialiser le dernier mur touché
			console.log('[collisionManager] this.canvas:',this.canvas);
			//ball.resetBall(this.canvas);
		}
	}

	private checkWallCollision(ball: Ball) {
		if (ball.position.x <= (0 +ball.size.width)) {
			ball.velocity.x *= -1; // Inverser la direction horizontale
			ball.lastWallBounce = 0;
			return;
		}
		if (ball.position.x + ball.size.width >= this.canvas.width) {
			ball.velocity.x *= -1; // Inverser la direction horizontale
			ball.lastWallBounce = 1;
			}
		if (ball.position.y <= (0 +ball.size.height)) {
			ball.velocity.y *= -1; // Inverser la direction verticale
			ball.lastWallBounce = 2;
			return;
		}
		if ((ball.position.y + ball.size.height) >= this.canvas.height) {
			ball.velocity.y *= -1; // Inverser la direction verticale
			ball.lastWallBounce = 3;
			return;
		}
	}

	/**
	 * Vérifie si la balle entre en collision avec les raquettes
	 * et met à jour les statistiques des joueurs
	 * fait rebondir la balle sur la raquette
	 * @param ball 
	 * @param players 
	 */
	private checkPaddleCollision(ball: Ball, players: Player[]) {
		players.forEach(player => {
			const paddle = player.paddle;
			if (paddle && this.isCollidingWithPaddle(ball,paddle)) {
				//update statistics //@TODO d autre statistiques
				player._historyPlayer.bounceCount++;
	
				ball.speed = 5;
				ball.lastHit = player;
				this.bounceOffPaddle(ball,player,paddle);
			}
		});
	}
	/**
	 * Vérifie si la balle entre en collision avec la raquette
	 * @param ball 
	 * @param paddle 
	 * @returns boolean
	 */
	private isCollidingWithPaddle(ball:Ball,paddle: Paddle): boolean {    
		return (
		ball.position.x < paddle.position.x + paddle.size.width +ball.size.width && //
		ball.position.x + ball.size.width > paddle.position.x &&
		ball.position.y < paddle.position.y + paddle.size.height  + ball.size.height&&
		ball.position.y + ball.size.height > paddle.position.y
		);
	}

	/**
	 * Fait rebondir la balle sur la raquette
	 * @param ball
	 * @param player
	 * @param paddle
	 */
	private bounceOffPaddle(ball:Ball,player:Player,paddle: Paddle) {
		//this._rebound = true;
		ball.lastWallBounce = null;
		ball.lastHit = player;

		let	side: string = '';
		if (ball.position.x < paddle.position.x) {
			side = 'left';
		}
		else if (ball.position.x > paddle.position.x + paddle.size.width) {
			side = 'right';
		}
		else if (ball.position.y < paddle.position.y) {
			side = 'top';
		}
		else if (ball.position.y > paddle.position.y + paddle.size.height) {
			side = 'bottom';
		}
		//	alert("side: " + side);
		//	console.log('in ball bounce, side:', side);

		let	impactRatio = 0;
		if (side === 'left' || side === 'right') {
			impactRatio = (ball.position.y - (paddle.position.y + paddle.size.height / 2)) / (paddle.size.height / 2);
		}
		else if (side === 'top' || side === 'bottom') {
			impactRatio = ((ball.position.x - (paddle.position.x + paddle.size.height / 2)) / (paddle.size.height / 2));
		}
		impactRatio = Math.max(-0.9, Math.min(0.9, impactRatio));
		
		const	maxAngle = 60 * Math.PI / 180;
		const	angle = impactRatio * maxAngle;
		
		if (side === 'left' || side === 'right') {
			const	directionSign = (side === 'right') ? 1 : -1;
			ball.velocity.x = Math.cos(angle) * directionSign;
			ball.velocity.y = Math.sin(angle);
		}
		if (side === 'top' || side === 'bottom') {
			const	directionSign = (side === 'bottom') ? 1 : -1;
			ball.velocity.x = Math.sin(angle);
			ball.velocity.y = Math.cos(angle) * directionSign;
		}
		
		ball.normalize();
		
		const	offset = ball.size.width + 0.1;
		ball.position.x += ball.velocity.x * offset;
		ball.position.y += ball.velocity.y * offset;
	}
}