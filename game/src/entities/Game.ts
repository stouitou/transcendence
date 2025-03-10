import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';
import { Player } from './Player.js';
import { Score } from './Score.js';
// import { EventEmitter } from "events";


// export allows to use this class in another file
export class Game {
	
	private readonly _ball: Ball;
	private readonly _paddleLeft: Paddle;
	private readonly _paddleRight: Paddle;
	private readonly _score: Score;
	private readonly _player1: Player; //joueur de droite
	private readonly _player2: Player; //joueur de gauche

	private _round: number = 3;
	
	private _beginning: boolean = true;
	
	/* CONSTRUCTOR */
	public constructor(player1: Player, player2:Player) {
		// super();	// call EventEmitter constructor
		this._ball = new Ball;
		this._paddleRight = new Paddle(1);
		this._paddleLeft = new Paddle(2);
		this._score = new Score;
		this._player1 = player1;
		this._player2 = player2;

		//this.launch();
	}

	/* METHODS */
	public launch() : Promise<void> {
		return new Promise((resolve) => {
		const loop = () => {

			if (this._round === 0)
			{
				this._player1.setInfoEndGame(this._player2);
				this._player2.setInfoEndGame(this._player1);
				resolve();
				return ;
			}

			// Launch movement
			if (this._beginning)
				this._ball.move(this._ball.startingSpeed);
			else
				this._ball.move(this._ball.speed);

			this._paddleLeft.move();
			this._paddleRight.move();

			this._paddleLeft.updatePosition();
			this._paddleRight.updatePosition();
			this._ball.updatePosition();

			// If touch a paddle...
			if (this._paddleLeft.collision(this._ball)) {
				this._beginning = false;
				this._ball.bounce(this._paddleLeft);
			}
			else if (this._paddleRight.collision(this._ball)) {
				this._beginning = false;
				this._ball.bounce(this._paddleRight);
			}
			// ...or touch a wall...
			else if (this._ball.top <= 0 || this._ball.bottom >= window.innerHeight)
				this._ball.direction.y *= -1;
			// ...or get out the field
			else if (this._ball.right <= 0 || this._ball.left >= window.innerWidth) {
				if (this._ball.right > window.innerWidth) //pas propre, a revoir
					this._player2.incrementScore();
				else
					this._player1.incrementScore();

				this._score.increaseScore(this._ball.right);
				this._beginning = true;
				this._ball.spawn();
				this._round--;
			}

			requestAnimationFrame(loop);
		};

		loop();
	});
	}
	
}
