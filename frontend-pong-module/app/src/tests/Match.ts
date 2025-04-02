import { Player } from "../entities/Player";
import { BallObject } from "./BallObject";
import { PaddleObject } from "./PaddleObject";

export class	Match {

	private readonly	_players: Player[];;

	private readonly	_score: HTMLDivElement;
	private readonly	_field: CanvasRenderingContext2D;
	private readonly	_width: number;
	private readonly	_height: number;
	private readonly	_color: string = 'rgb(0, 0, 0)';

	private readonly	_ball: BallObject;
	private readonly	_paddles: PaddleObject[] = [];

	private readonly	_pointsToWin: number = 100;
	private				_winner: Player | null = null;	

	private				_break: boolean = false;

	constructor (players: Player[], container: HTMLDivElement) {
		this._players = players;

		this._score = document.createElement('div');
		this._score.style.position = 'relative';
		this._score.style.width = '700px';
		this._score.style.height = 'auto';
		this._score.style.minHeight = '100px';
		this._score.style.top = '0';
		this._score.style.margin = '0px';
		container.appendChild(this._score);

		const	canvas: HTMLCanvasElement = document.createElement('canvas');
		canvas.style.position = 'relative';
		canvas.style.margin = '0';
		canvas.style.padding = '0';
		canvas.style.border = 'none';
		canvas.style.top = '0';
		canvas.style.verticalAlign = 'top';
		canvas.width = 700;
		if (this._players.length === 2)
			canvas.height = 500;
		else if (this._players.length > 2)
			canvas.height = 700;
		container.appendChild(canvas);

		this._field = canvas.getContext('2d')!;
		this._width = canvas.width;
		this._height = canvas.height;
		
		this._ball = new BallObject(canvas);
		for (let i = 0; i < this._players.length; i++)
			this._paddles[i] = new PaddleObject(canvas, i);

		this.eventListener();

		this.launch();
	}

	get players () {
		return this._players;
	}

	get field () {
		return this._field;
	}

	get width () {
		return this._width;
	}

	get height () {
		return this._height;
	}

	get color () {
		return this._color;
	}

	get ball () {
		return this._ball;
	}
	
	get paddles () {
		return this._paddles;
	}

	get pointsToWin () {
		return this._pointsToWin;
	}

	get winner () {
		return this._winner;
	}

	get break () {
		return this._break;
	}
	
	async launch () : Promise<void> {
		this.displayScore();
		await this.displayCountdown();

		return new Promise((resolve) => {
			const	loop = () => {
				this._players.forEach((player) => {
					if (player.score === this._pointsToWin) {
						this._winner = player;
						resolve();
					}
				})
		
				if (!this._break) {
					this.run();

					this._paddles.forEach((paddle => paddle.collision(this._ball)))

					if (!this._players[2] && this._ball.y + this._ball.radius >= this._height ||
						!this._players[3] && this._ball.y - this._ball.radius <= 0) {
						this._ball.direction.y *= -1;
					}

					else if (this._ball.out()) {
						this._ball.spawn();
					}
				}
				requestAnimationFrame(loop);
			}

			loop();
		});
	}
		
	private run () {

		this._field.clearRect(0, 0, this._width, this._height);

		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);

		this._ball.move();
		this._paddles.forEach((paddle) => paddle.move());
	}

	private displayScore () {
		this._score.style.width = '700px';
		this._score.style.height = 'auto';
		this._score.style.minHeight = '100px';
		this._score.style.top = '0';
		this._score.style.margin = '0px';
		this._score.style.backgroundColor = 'rgb(0, 0, 0)';
		this._score.style.borderRadius = '20px';
		this._score.style.border = 'none';
		this._score.style.boxShadow = 'inset 0 0 0 3px rgb(0, 255, 0)';
		this._score.style.color = 'rgb(255, 0, 0)';
		this._score.style.textAlign = 'center';
		this._score.style.fontSize = '30px';
		this._score.style.fontFamily = 'system-ui';
	}

	private displayVersus () {
		this._field.clearRect(0, 0, this._width, this._height);
		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);

		this._field.font = '50px system-ui';
		this._field.fillStyle = 'rgb(255, 0, 0)';
		this._field.textBaseline = 'middle';
		this._field.textAlign = 'right';
		this._field.fillText('player1', this._width - 30, this._height / 2 - 60);
		this._field.textAlign = 'left';
		this._field.fillText('player2', 30, this._height / 2 + 60);
	}

	private async displayCountdown () : Promise<void> {
		const	countdown: string[] = ['3', '2', '1', 'GO'];
		const	color: string = 'rgb(255, 0, 0)';
		
		return new Promise ((resolve) => {
			for (let i = 0; i < countdown.length; i++) {
				setTimeout(() => {
					this.displayVersus();
					this._field.font = '80px system-ui';
					this._field.textAlign = 'center';
					this._field.textBaseline = 'middle';
					this._field.fillStyle = color;
					this._field.fillText(countdown[i], this._width / 2, this._height / 2);
					if (i === countdown.length - 1)
						resolve();
				}, i * 1000);
			}
		});
	}

	private displayPause () {
		const	barWidth: number = 15;
		const	barHeight: number = 40;
		const	space: number = 6;
		const	color: string = 'rgb(255, 0, 0)';

		this._field.fillStyle = color;
		this.field.fillRect(this._width / 2 - space / 2 - barWidth, this._height - 5 - barHeight, barWidth, barHeight);
		this.field.fillRect(this._width / 2 + space / 2, this._height - 5 - barHeight, barWidth, barHeight);
	}

	private eventListener () {
		document.addEventListener('keydown', (event) => {
			if (event.key === ' ') {
				this._break = !this._break;
				if (this._break)
					this.displayPause();
			}
		})
	}
}