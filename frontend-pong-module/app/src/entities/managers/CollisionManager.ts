import { Ball } from '../Ball';
import { Player } from '../Player';
import { Paddle } from '../Paddle';

export class	CollisionManager {

	private readonly	_canvas = { width: 800, height: 600 };

	handleCollisions (ball: Ball, players: Player[]) {
		this.checkWallCollision(ball, players.length);
		this.checkPaddleCollision(ball, players);
	}

	private checkWallCollision (ball: Ball, nbOfPlayers: number) {
		if (ball.position.x + ball.size.width >= this._canvas.width) {
			ball.lastWallBounce = 0;
			if (ball.lastHit && ball.lastWallBounce < nbOfPlayers)	{ return ; }
			ball.velocity.x *= -1;	// reverse horizontal direction
			ball.position = {x: ball.position.x + ball.velocity.x * ball.size.width, y: ball.position.y + ball.velocity.y * ball.size.height};
			return ;
		}
		if (ball.position.x <= (0 + ball.size.width)) {
			ball.lastWallBounce = 1;
			if (ball.lastHit && ball.lastWallBounce < nbOfPlayers)	{ return ; }
			ball.velocity.x *= -1;	// reverse horizontal direction
			ball.position = {x: ball.position.x + ball.velocity.x * ball.size.width, y: ball.position.y + ball.velocity.y * ball.size.height};
			return ;
		}
		if ((ball.position.y + ball.size.height) >= this._canvas.height) {
			ball.lastWallBounce = 2;
			if (ball.lastHit && ball.lastWallBounce < nbOfPlayers)	{ return ; }
			ball.velocity.y *= -1;	// reverse vertical direction
			ball.position = {x: ball.position.x + ball.velocity.x * ball.size.width, y: ball.position.y + ball.velocity.y * ball.size.height};
			return ;
		}
		if (ball.position.y <= (0 + ball.size.height)) {
			ball.lastWallBounce = 3;
			if (ball.lastHit && ball.lastWallBounce < nbOfPlayers)	{ return ; }
			ball.velocity.y *= -1;	// reverse vertical direction
			ball.position = {x: ball.position.x + ball.velocity.x * ball.size.width, y: ball.position.y + ball.velocity.y * ball.size.height};
			return ;
		}
	}

	private checkPaddleCollision (ball: Ball, players: Player[]) {
		players.forEach(player => {
			const	paddle = player.paddle;
			if (paddle && this.isCollidingWithPaddle(ball, paddle)) {
				ball.maxBounceCountRound++;
				//update statistics //@TODO d autre statistiques
				player.history.bounceCount++;
				ball.lastHit = player;
				this.bounceOffPaddle(ball, paddle);
			}
		});
	}

	private isCollidingWithPaddle (ball:Ball, paddle: Paddle) : boolean {    
		return (
			ball.position.x - ball.size.width < paddle.position.x + paddle.size.width &&
			ball.position.x + ball.size.width > paddle.position.x &&
			ball.position.y - ball.size.height < paddle.position.y + paddle.size.height &&
			ball.position.y + ball.size.height > paddle.position.y
		);
	}

	private bounceOffPaddle (ball: Ball, paddle: Paddle) {
		ball.lastWallBounce = null;

		const	side = this.getSideCollision(ball, paddle);

		let	impactRatio = 0;
		if (side === 'left' || side === 'right') {
			impactRatio = (ball.position.y - (paddle.position.y + paddle.size.height / 2)) / (paddle.size.height / 2);
		}
		else if (side === 'top' || side === 'bottom') {
			impactRatio = ((ball.position.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2));
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

	// Get the side of the paddle that has been touched by the ball
	private getSideCollision (ball: Ball, paddle: Paddle) {
		const	dxLeft = Math.abs(ball.position.x - paddle.position.x);
		const	dxRight = Math.abs(ball.position.x - (paddle.position.x + paddle.size.width));
		const	dyTop = Math.abs(ball.position.y - paddle.position.y);
		const	dyBottom = Math.abs(ball.position.y - (paddle.position.y + paddle.size.height));

		const	possibleSides: { side: string, dist: number }[] = [];

		if (ball.velocity.x > 0)	possibleSides.push({ side: 'left', dist: dxLeft });
		if (ball.velocity.x < 0)	possibleSides.push({ side: 'right', dist: dxRight });
		if (ball.velocity.y > 0)	possibleSides.push({ side: 'top', dist: dyTop });
		if (ball.velocity.y < 0)	possibleSides.push({ side: 'bottom', dist: dyBottom });

		if (possibleSides.length === 0)	{ return 'left' ; }

		let	best = possibleSides[0];
		for (const side of possibleSides) {
			if (side.dist < best.dist)	{ best = side; }
		}
		return best.side ;
	}
}