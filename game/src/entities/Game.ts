import { Ball } from './Ball';
import { Paddle } from './Paddle';

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

		if (Math.random() < 0.5)
			this._animate('right');
		else
			this._animate('left');

	}

	private _animate(direction: 'left' | 'right') {
		const loop = () => {

			// Move subsequently
			if (this._paddleLeft.keys['s'] || this._paddleLeft.keys['x']) {
				this._paddleLeft.move();
			}
			if (this._paddleLeft.keys['ArrowUp'] || this._paddleLeft.keys['ArrowDown']) {
				this._paddleRight.move();
			}

			if (direction === 'right')
				this._ball.moveRight();
			else
				this._ball.moveLeft();
	
			// Function called when browser refreshes pages
			requestAnimationFrame(loop);
		};

		loop();
	}
}
