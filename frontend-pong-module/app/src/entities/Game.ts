import { Ball } from './Ball.js';
import { Board } from './Board.js';
import { Countdown } from './Countdown.js';
import { Pause } from './Pause.js';
import { Player } from './Player.js';
import { Versus } from './Versus.js';

// export allows to use this class in another file
export class	Game {

	/* ATTRIBUTES */
	// private readonly	_canvas: HTMLCanvasElement;

	private readonly	_ball: Ball;
	private readonly	_board: Board;
	private readonly	_player1: Player;	// player on the right
	private readonly	_player2: Player;	// player on the left
	private readonly	_countdown: Countdown;
	private readonly	_versus: Versus;
	private readonly	_pause: Pause;

	private				_pointsToWin: number = 1;
	private				_winner: Player | null = null;

	private				_beginning: boolean = true;
	private				_break: boolean = false;

	/* CONSTRUCTOR */
	constructor(player1: Player, player2:Player) {
		// this._canvas = canvas;
		this._ball = new Ball();
		this._board = new Board(player1, player2);
		this._player1 = player1;
		player1.paddle = 1;
		this._player2 = player2;
		player2.paddle = 2;
		this._pause = new Pause();
		this._versus = new Versus(player1, player2);
		this._countdown = new Countdown();

		this.eventListeners();
	}

	/* GETTERS */
	public get winner () {
		return this._winner ;
	}

	/* METHODS */
	public async launch () : Promise<void> {
		this._versus.display();
		await this._countdown.start();
		this._board.display();
		return new Promise((resolve) => {
			// const	gameContainer = this._canvas.parentElement as HTMLElement;
			// gameContainer.appendChild(this._ball.element);	
			document.body.appendChild(this._ball.element);

			const loop = () => {
				if (this.endOfGame()) {
					resolve();
					return ;
				}

				// Launch movement
				if (!this._break) {
					this.launchMovement();

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
					// else if (this._ball.top <= 0 || this._ball.bottom >= gameContainer.height)
					// 	this._ball.direction.y *= -1;
					// Avoid the ball being blocked in the middle of the wall ?
					else if (this._ball.top <= 0) {
						this._ball.element.style.top = '0px';				
						this._ball.direction.y *= -1;
					}
					else if (this._ball.bottom >= window.innerHeight) {
						this._ball.element.style.top = `calc(${window.innerHeight} + ${this._ball.diameter})px`;				
						this._ball.direction.y *= -1;
					}
					// else if (this._ball.top <= gameContainer.offsetTop) {
					// 	this._ball.element.style.top = `${gameContainer.offsetTop}px`;				
					// 	this._ball.direction.y *= -1;
					// }
					// else if (this._ball.bottom >= gameContainer.offsetTop + gameContainer.offsetHeight) {
					// 	this._ball.element.style.top = `calc(${gameContainer.offsetTop + gameContainer.offsetHeight - this._ball.diameter})px`;				
					// 	this._ball.direction.y *= -1;
					// }
					// ...or get out the field
					else if (this._ball.right >= window.innerWidth || this._ball.left <= 0) {
						this._board.score(this._ball.right);
						this._beginning = true;
						this._ball.spawn();
					}
					// else if (this._ball.right <= gameContainer.offsetLeft || this._ball.left >= gameContainer.offsetLeft + gameContainer.offsetWidth) {
					// 	this._board.score(this._ball.right);
					// 	this._beginning = true;
					// 	this._ball.spawn();
					// }
				}
				requestAnimationFrame(loop);
			};

			loop();
		});
	}

	private endOfGame () {
		if (this._player1.score === this._pointsToWin ||
			this._player2.score === this._pointsToWin) {
				this._player1.setInfoEndGame(this._pointsToWin);
				this._player2.setInfoEndGame(this._pointsToWin);
				// this._player1.setInfoEndGame(this._pointsToWin, this._player2);
				// this._player2.setInfoEndGame(this._pointsToWin, this._player1);
				return true ;
			}
		return false ;
	}

	private launchMovement () {
		if (this._beginning)
			this._ball.move(this._ball.startingSpeed);
		else
			this._ball.move(this._ball.speed);

		this._player1.paddle.move();
		this._player2.paddle.move();

		this._player1.paddle.updatePosition();
		this._player2.paddle.updatePosition();
		this._ball.updatePosition();
	}

	private eventListeners () {
		
		document.body.addEventListener('keydown', (event) => {
			if (event.key === " ") {
				this._break = !this._break;
				if (this._break)
					this._pause.display();
				else
					this._pause.hide();
			}
        });
	}
}
