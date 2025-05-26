import { Position, Size } from "../../types/gameUtils.type";
import { Ball } from "../gameClass/Ball";
import { Paddle } from "../gameClass/Paddle";

export class GameBallManager {
	private ball: Ball;
	private ballSize: Size;
	private ballVelocity: Position;
	private _canvas: Size;

	constructor(canvas: Size, size: Size, initialVelocity: Position) {
		this._canvas = canvas;
		this.ballSize = size;
		this.ballVelocity = initialVelocity;
		this.ball = new Ball(
			{ x: canvas.width / 2, y: canvas.height / 2 },
			size,
			initialVelocity,
			canvas
		);
	}

	createBall(position: Position): Ball {
		const newBall = new Ball(position, this.ballSize, this.ballVelocity, this._canvas);
		return newBall;
	}
	updateBall(ball: Ball): void {
		ball.update();
	}
	resetBall(ball: Ball, position: Position, velocity: Position): void {
		ball.reset(/* position, velocity */);
	}
	getBall(): Ball {
		return this.ball;
	}
	resetBallPosition(): void {
		this.ball.reset(/* { x: this._canvas.width / 2, y: this._canvas.height / 2 },
			{ x: -this.ball.velocity.x, y: -this.ball.velocity.y } */);
	}

	hasCollision(paddle: Paddle): boolean {
		return (
			this.ball.position.x < paddle.position.x + paddle.size.width &&
			this.ball.position.x + this.ball.size.width > paddle.position.x &&
			this.ball.position.y < paddle.position.y + paddle.size.height &&
			this.ball.position.y + this.ball.size.height > paddle.position.y
		);
	}
	handleBallBouncePlayer(playerIndex:number): void {
		// Inverser la vélocité selon le côté du paddle touché
		if (playerIndex === 0 || playerIndex === 1) {
			this.ball.velocity.x *= -1;
		} else if (playerIndex === 2 || playerIndex === 3) {
			this.ball.velocity.y *= -1;
		}
	}
	handleBallBounceWall(): number {
		// Inverser la vélocité selon le mur touché
		// retourne le mur touché
		  // Collision avec les murs
			//mur left 
			if (this.ball.position.x <= 0) {
				this.ball.velocity.x *= -1; // Inverser la direction horizontale
				return 1; // 
			  }
			//mur right
			if (this.ball.position.x + this.ball.size.width >= this._canvas.width) {
				this.ball.velocity.x *= -1; // Inverser la direction horizontale
				return 0; //
			}
			//mur top
			if (this.ball.position.y <= 0) {
				this.ball.velocity.y *= -1; // Inverser la direction verticale
				return 2; //
			  }
			//mur botom
			if (this.ball.position.y + this.ball.size.height >= this._canvas.height) {
				this.ball.velocity.y *= -1; // Inverser la direction verticale
				return 3; //
			  }
			return -1; // Aucune collision
	}
}