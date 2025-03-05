import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';

var round: number = 0;
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

			if (round === 5)
				return ;

			// Move subsequently
			if (this._paddleLeft.keys['s'] || this._paddleLeft.keys['x']) {
				this._paddleLeft.move();
			}
			if (this._paddleLeft.keys['ArrowUp'] || this._paddleLeft.keys['ArrowDown']) {
				this._paddleRight.move();
			}

			this._ball.move();

			this._paddleLeft.checkCollision(this._ball);
			this._paddleRight.checkCollision(this._ball);

			if (this._ball.element.offsetTop <= 0 ||
				this._ball.element.offsetTop + this._ball.diameter >= window.innerHeight) {
					this._ball.direction.y *= -1;
			}
			if (this._ball.element.offsetLeft + this._ball.diameter <= 0 ||
				this._ball.element.offsetLeft >= window.innerWidth) {
				this._ball.spawn();
				round++;
				// return ;
			}
			// if ((this._ball.element.offsetLeft <= this._paddleLeft.element.offsetLeft + this._paddleLeft.width &&
			// 	(this._ball.element.offsetTop - this._ball.diameter >= this._paddleLeft.element.offsetTop &&
			// 	this._ball.element.offsetTop <= this._paddleLeft.element.offsetTop + this._paddleLeft.height)) ||
			// 	(this._ball.element.offsetLeft + this._ball.diameter >= this._paddleRight.element.offsetLeft &&
			// 	(this._ball.element.offsetTop - this._ball.diameter >= this._paddleRight.element.offsetTop &&
			// 	this._ball.element.offsetTop <= this._paddleRight.element.offsetTop + this._paddleRight.height))) {
			// 	this._ball.direction.x *= -1;
			// }

			requestAnimationFrame(loop);
		};
		
		loop();
	}
}

// θrebond ​= θmax ​× (2 × ((yimpact​−yraquette) / hauteur raquette​)​)
// θrebond: angle de rebond recherche
// θmax: angle de rebond maximum autorise (75, comme a l'initialisation de la balle ?)
// yimpact: position y de la balle au moment du contact
// yraquette: position y du centre de la raquette
// hauteur raquette: hauteur totale de la raquette
