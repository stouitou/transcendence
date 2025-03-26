import { Ball } from './Ball.js';
import { Board } from '../display/Board.js';
import { Countdown } from '../additional/Countdown.js';
import { Pause } from '../additional/Pause.js';
import { Player } from './Player.js';
import { Versus } from '../display/Versus.js';

// export allows to use this class in another file
export class	Game {

	/* ATTRIBUTES */
	 private readonly	_canvas: HTMLDivElement;

	private readonly	_ball: Ball;
	private readonly	_board: Board;
	private readonly	_players: Player[];
	//private readonly	_player1: Player;	// player on the right
	//private readonly	_player2: Player;	// player on the left
	private readonly	_countdown: Countdown;
	private readonly	_versus: Versus;
	private readonly	_pause: Pause;

	private				_pointsToWin: number = 100;
	private				_winner: Player | null = null;

	private				_beginning: boolean = true;
	private				_break: boolean = false;

	private				_rally: number = 0;

	/* CONSTRUCTOR */
	constructor(players: Player[], canvas: HTMLDivElement) {
		this._players = players;
		this._canvas = canvas;
		if (this._players.length > 2)
			this._canvas.style.height = `${this._canvas.style.width}`;

		this._ball = new Ball(this._canvas);
		this._board = new Board(this._players, this._canvas);
		//this._player1 = players[0];
		this._players[0].paddle = 1;
		//this._player2 = players[1];
		this._players[1].paddle = 2;
		if (this._players[2])
			this._players[2].paddle = 3;
		if (this._players[3])
			this._players[3].paddle = 4;
		this._pause = new Pause(this._canvas);
		this._versus = new Versus(this._players, this._canvas);
		this._countdown = new Countdown(this._canvas);

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
		this._ball.element.style.display = "block";
		return new Promise((resolve) => {

			const loop = () => {
				if (this.endOfGame()) {
					resolve();
					return ;
				}

				// Launch movement
				if (!this._break) {
					this.launchMovement();

					// If touch a paddle...
					for (let i = 0; i < this._players.length; i++) {
						if (this._players[i].paddle.collision(this._ball)) {
							this._rally++;
							this._beginning = false;
						}
					}
					// ...or touch a wall...
					if (!this._players[2] && this._ball.bottom >= this._canvas.offsetHeight) {
						this._ball.element.style.bottom = "100%";				
						this._ball.direction.y *= -1;
					}
					else if (!this._players[3] && this._ball.top <= 0) {
						this._ball.element.style.top = "0%";				
						this._ball.direction.y *= -1;
					}
					// ...or get out the field
					else if (this._ball.left >= this._canvas.offsetWidth ||
						this._ball.right <= 0 || 
						(this._players[2] && this._ball.top >= this._canvas.offsetHeight) ||
						(this._players[3] && this._ball.bottom <= 0)) {
						this._board.score(this._ball);
						this._beginning = true;
						this._ball.spawn();
					}
				}
				requestAnimationFrame(loop);
			};
			
			loop();
		});
	}

	private endOfGame () {
		if (this._players[0].score === this._pointsToWin ||
			this._players[1].score === this._pointsToWin) {
				this._players[0].setInfoEndGame(this._pointsToWin);
				this._players[1].setInfoEndGame(this._pointsToWin);
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

		this._players[0].paddle.move();
		this._players[1].paddle.move();

		this._players[0].paddle.updatePosition();
		this._players[1].paddle.updatePosition();

		if (this._players[2]) {
			this._players[2].paddle.move();
			this._players[2].paddle.updatePosition();
		}

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
