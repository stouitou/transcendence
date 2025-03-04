import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';
import { Direction } from './Direction.js';
import { vector } from "../types/Ball.types";

// export allows to use this class in another file
export class Game {

	private readonly _ball: Ball;
	private readonly _paddleLeft: Paddle;
	private readonly _paddleRight: Paddle;

	/* CONSTRUCTOR */
	public constructor() {
		this._ball = new Ball;
		this._paddleLeft = new Paddle('left');
		this._paddleRight = new Paddle('right');

		this._animate();
	}

	private _animate() {
		const loop = () => {

			// Move subsequently
			if (this._paddleLeft.keys['s'] || this._paddleLeft.keys['x']) {
				this._paddleLeft.move();
			}
			if (this._paddleLeft.keys['ArrowUp'] || this._paddleLeft.keys['ArrowDown']) {
				this._paddleRight.move();
			}

			this._ball.move();

			requestAnimationFrame(loop);
		};

		loop();
	}
}
