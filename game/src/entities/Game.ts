import { Ball } from './Ball.js';
import { Board } from './Board.js';
import { Player } from './Player.js';

// export allows to use this class in another file
export class Game {

	private readonly	_ball: Ball;
	private readonly	_board: Board;
	private readonly	_player1: Player; // player on the right
	private readonly	_player2: Player; // player on the left

	private				_round: number = 3;
	
	private				_beginning: boolean = true;
	
	/* CONSTRUCTOR */
	public constructor(player1: Player, player2:Player) {
		this._ball = new Ball();
		this._board = new Board(player1, player2);
		this._player1 = player1;
		player1.paddle = 1;
		this._player2 = player2;
		player2.paddle = 2;
	}

	/* METHODS */
	public launch() : Promise<void> {
		return new Promise((resolve) => {
			const loop = () => {

				if(this._player1.paddle == null) throw "err";
				if(this._player2.paddle == null) throw "err";

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

				this._player1.paddle.move();
				this._player2.paddle.move();

				this._player1.paddle.updatePosition();
				this._player2.paddle.updatePosition();
				this._ball.updatePosition();

				// If touch a paddle...
				if (this._player1.paddle.collision(this._ball)) {
					this._beginning = false;
					this._ball.bounce(this._player1.paddle);
				}
				else if (this._player2.paddle.collision(this._ball)) {
					this._beginning = false;
					this._ball.bounce(this._player2.paddle);
				}
				// ...or touch a wall...
				else if (this._ball.top <= 0 || this._ball.bottom >= window.innerHeight)
					this._ball.direction.y *= -1;
				// ...or get out the field
				else if (this._ball.right <= 0 || this._ball.left >= window.innerWidth) {
					this._board.update(this._ball.right);
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
