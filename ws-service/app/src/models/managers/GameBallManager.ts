import { Position, Size } from "../../types/gameUtils.type";
import { Ball } from "../gameClass/Ball";
import { Paddle } from "../gameClass/Paddle";

export class GameBallManager {
	private _ball: Ball;
	private _ballSize: Size;
	private _ballVelocity: Position;
	private _canvas: Size;

	constructor(canvas: Size, size: Size, initialVelocity: Position) {
		this._canvas = canvas;
		this._ballSize = size;
		this._ballVelocity = initialVelocity;
		this._ball = new Ball(
			{ x: canvas.width / 2, y: canvas.height / 2 },
			size,
			initialVelocity,
			canvas
		);
	}

	get ball ()	{ return this._ball ; }

	createBall(position: Position): Ball {
		const newBall = new Ball(position, this._ballSize, this._ballVelocity, this._canvas);
		return newBall;
	}
	updateBall(ball: Ball): void {
		ball.update();
	}
	resetBall(ball: Ball, position: Position, velocity: Position): void {
		ball.reset(/* position, velocity */);
	}
	getBall(): Ball {
		return this._ball;
	}
	resetBallPosition(): void {
		this._ball.reset(/* { x: this._canvas.width / 2, y: this._canvas.height / 2 },
			{ x: -this._ball.velocity.x, y: -this._ball.velocity.y } */);
	}

	hasCollision(paddle: Paddle): boolean {
		return (
			this._ball.position.x < paddle.position.x + paddle.size.width &&
			this._ball.position.x + this._ball.size.width > paddle.position.x &&
			this._ball.position.y < paddle.position.y + paddle.size.height &&
			this._ball.position.y + this._ball.size.height > paddle.position.y
		);
	}
	handleBallBouncePlayer(playerIndex:number): void {
		// Inverser la vélocité selon le côté du paddle touché
		if (playerIndex === 0 || playerIndex === 1) {
			this._ball.velocity.x *= -1;
		} else if (playerIndex === 2 || playerIndex === 3) {
			this._ball.velocity.y *= -1;
		}
	}
	handleBallBounceWall(): number {
		// Inverser la vélocité selon le mur touché
		// retourne le mur touché
		  // Collision avec les murs
			//mur left 
			if (this._ball.position.x <= 0) {
				this._ball.velocity.x *= -1; // Inverser la direction horizontale
				return 1; // 
			  }
			//mur right
			if (this._ball.position.x + this._ball.size.width >= this._canvas.width) {
				this._ball.velocity.x *= -1; // Inverser la direction horizontale
				return 0; //
			}
			//mur top
			if (this._ball.position.y <= 0) {
				this._ball.velocity.y *= -1; // Inverser la direction verticale
				return 2; //
			  }
			//mur botom
			if (this._ball.position.y + this._ball.size.height >= this._canvas.height) {
				this._ball.velocity.y *= -1; // Inverser la direction verticale
				return 3; //
			  }
			return -1; // Aucune collision
	}
}