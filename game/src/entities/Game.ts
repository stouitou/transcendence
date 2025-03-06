import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';

var round: number = 3;
// export allows to use this class in another file
export class Game {

	private readonly _ball: Ball;
	private readonly _paddleLeft: Paddle;
	private readonly _paddleRight: Paddle;

	/* CONSTRUCTOR */
	public constructor() {
		this._ball = new Ball;
		this._paddleRight = new Paddle(1);
		this._paddleLeft = new Paddle(2);

		this._animate();
	}

	private _animate() {
		const loop = () => {

			if (round === 0)
				return ;

			// Launch movement
			this._ball.move();
			this._paddleLeft.move();
			this._paddleRight.move();

			this._paddleLeft.updatePosition();
			this._paddleRight.updatePosition();
			this._ball.updatePosition();

			// If touch a paddle...
			if (this._paddleLeft.collision(this._ball))
				this._ball.bounce(this._paddleLeft);
			else if (this._paddleRight.collision(this._ball))
				this._ball.bounce(this._paddleRight);
			// ...or touch a wall...
			else if (this._ball.top <= 0 ||
				this._ball.bottom >= window.innerHeight) {
					this._ball.direction.y *= -1;
			}
			// ...or get out the field
			else if (this._ball.right <= 0 ||
				this._ball.left >= window.innerWidth) {
				this._ball.spawn();
				round--;
			}

			requestAnimationFrame(loop);
		};

		loop();
	}
}
