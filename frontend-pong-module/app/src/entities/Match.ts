import { Player } from "./Player";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { Alert } from "./Alert";

export class	Match {

	private	readonly	_gameWrapper: HTMLDivElement;		// main container created in the frontend
	private readonly	_players: Player[];					// array of players

	private	readonly	_appendix: HTMLDivElement;			// appendix for the score
	private readonly	_field: CanvasRenderingContext2D;	// field rendered by the canvas
	private readonly	_width: number;						// width of the field
	private readonly	_height: number;					// height of the field
	private readonly	_color: string = 'rgb(0, 0, 0)';	// color of the field

	private readonly	_ball: Ball;
	private readonly	_paddles: Paddle[] = [];

	private readonly	_pointsToWin: number = 2;			// number of points required to end the match
	private				_winner: Player | null = null;		// winner of the match, while match is running, winner = null

	private				_break: boolean = false;			// boolean to pause the game

	constructor (players: Player[], container: HTMLDivElement) {
		this._gameWrapper = container;
		this._players = players;
		this._appendix = document.createElement('div');
		this.appendixProperties();
		this._gameWrapper.appendChild(this._appendix);
		
		const canvas: HTMLCanvasElement = this.createCanvas()!;
		canvas.style.background = 'rgb(0, 0, 0)';
		this._field = canvas.getContext('2d') as CanvasRenderingContext2D;
		this._width = canvas.width;
		this._height = canvas.height;
		this._gameWrapper.appendChild(canvas);
		
		this._ball = new Ball(canvas);
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].location = i;
			this._players[i].points = 0;
			this._players[i].paddle = new Paddle(canvas, this._players[i].location, this._players[i].role);
		}
		// for (let i = 0; i < this._players.length; i++)
		// 	this._paddles[i] = new Paddle(canvas, i, players[i].role);

		this.eventListener();
	}

	get gameWrapper () {
		return this._gameWrapper;
	}

	get players () {
		return this._players;
	}

	get appendix () {
		return this._appendix;
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
	
	public async launch () : Promise<void> {
		await this.startGame();
		this.displayScore();
		await this.displayCountdown();

		return new Promise((resolve) => {
			const loop = async () => {
				for (const player of this._players) {
					if (player.points === this._pointsToWin) {
						await this.endGame(player);
						this._players.forEach((player) => {player.display.innerHTML = '';});
					//	this._gameWrapper.removeChild(this._appendix);
					//	this._gameWrapper.removeChild(this._field.canvas);	
					
					// Create a new Action alert
							const	alert: Alert = new Alert(`new Action //TODO !\n`);
							this._gameWrapper.appendChild(alert.element);
							setTimeout(() => {
								this._gameWrapper.removeChild(alert.element);
								resolve();
							}, 4000);
					// end Action alert

						resolve();
						return ;
					}
				}
				
				if (!this._break) {
					this.run();
					
					this._players.forEach((player) => player.paddle!.collision(this._ball))
					
					if (!this._players[2] && this._ball.y + this._ball.radius >= this._height ||
						!this._players[3] && this._ball.y - this._ball.radius <= 0) {
							this._ball.direction.y *= -1;
						}
						
						else if (this._ball.out(this._players)) {
							this._ball.spawn();
						}
					}
					requestAnimationFrame(loop);
				}
				
			loop();
		});
	}
		
	private appendixProperties () {
		this._appendix.style.position = 'relative';
		this._appendix.style.width = '100%';
		this._appendix.style.height = 'auto';
		this._appendix.style.minHeight = '100px';
		this._appendix.style.display = 'flex';
		this._appendix.style.alignItems = 'center';
		this._appendix.style.top = '0';
		this._appendix.style.margin = '0';
		this._appendix.style.backgroundColor = 'rgb(0, 0, 0)';
		this._appendix.style.borderRadius = '50% 50% 0 0';
		this._appendix.style.border = 'none';
		this._appendix.style.boxShadow = 'inset 0 0 0 3px rgb(255, 0, 0)';
		this._appendix.style.color = 'rgb(255, 0, 0)';
		this._appendix.style.textAlign = 'center';
		this._appendix.style.fontSize = '40px';
		this._appendix.style.fontFamily = 'system-ui';
	}

	private createCanvas () {
		const	canvas: HTMLCanvasElement = document.createElement('canvas');

		canvas.style.position = 'relative';
		canvas.style.margin = '0';
		canvas.style.padding = '0';
		canvas.style.border = 'none';
		canvas.style.top = '0';
		canvas.style.verticalAlign = 'top';
		//canvas.width = 700;
		canvas.width = this._gameWrapper.clientWidth;
		if (this._players.length === 2)
			canvas.height = 500;
		else if (this._players.length > 2)
			canvas.height = 700;

		return canvas;
	}

	private async startGame () : Promise<void> {
		return new Promise((resolve) => {
			const	alert: Alert = new Alert(`${this._players[0].name}\nvs\n${this._players[1].name}\n`);
			
			const	button: HTMLButtonElement = document.createElement('button');
			button.style.minWidth = '50%';
			button.style.marginTop = '20px';
			button.style.border = '2px solid rgb(0, 0, 0)';
			button.style.borderRadius = '5px';
			button.style.padding = '5px';
			button.style.cursor = 'pointer';
			// style of the text in the button
			button.classList.add('text-black', 'text-lg', 'font-bold', 'font-sans', 'transition-colors', 'hover:bg-black', 'hover:text-white');	// font-sans: fontFamily = 'system-ui'
			button.textContent = 'Start';
			button.addEventListener('click', () => {
				this._gameWrapper.removeChild(alert.element);
				resolve();
			});
			alert.element.appendChild(button);
			this._gameWrapper.appendChild(alert.element);
		});
	}

	private run () {

		this._field.clearRect(0, 0, this._width, this._height);

		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);

		this._ball.move();
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].paddle!.move(this._players[i], this._ball);
		}
	}

	private displayScore () {
		this._players.forEach((player) => {
			const	name: HTMLParagraphElement = document.createElement('p');
			name.textContent = player.name;
			name.style.margin = '10px';
			const	score: HTMLParagraphElement = document.createElement('p');
			score.textContent = `${player.points}`;
			score.style.margin = '10px';
			if (player.location === 0) {
				player.display.style.order = '1';
				name.style.color = 'rgb(255, 0, 0)';
				score.style.color = 'rgb(255, 0, 0)';
				name.style.order = '1';
				score.style.order = '0';
			}
			else if (player.location === 1) {
				player.display.style.order = '0';
				name.style.color = 'rgb(255, 0, 0)';
				score.style.color = 'rgb(255, 0, 0)';
				name.style.order = '0';
				score.style.order = '1';
			}
			player.display.appendChild(name);
			player.display.appendChild(score);
			this._appendix.appendChild(player.display);
		});
	}

	private displayVersus () {
		this._field.clearRect(0, 0, this._width, this._height);
		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);

		this._field.font = '50px system-ui';
		this._field.fillStyle = 'rgb(255, 0, 0)';
		this._field.textBaseline = 'middle';
		this._field.textAlign = 'right';
		this._field.fillText(`${this._players[0].name}`, this._width - 30, this._height / 2 - 60);
		this._field.textAlign = 'left';
		this._field.fillText(`${this._players[1].name}`, 30, this._height / 2 + 60);
	}

	private async displayCountdown () : Promise<void> {
		const	countdown: string[] = ['3', '2', '1', 'GO'];
		
		return new Promise ((resolve) => {
			for (let i = 0; i < countdown.length; i++) {
				setTimeout(() => {
					this.displayVersus();
					this._field.font = '80px system-ui';
					this._field.textAlign = 'center';
					this._field.textBaseline = 'middle';
					this._field.fillStyle = 'rgb(255, 0, 0)';
					this._field.fillText(countdown[i], this._width / 2, this._height / 2);
					if (i === countdown.length - 1)
						resolve();
				}, i * 1000);
			}
		});
	}
	
	private async endGame (winner: Player) : Promise<void> {
		winner.lastWin = true;
		this._players.forEach((player) => {
			if (player !== winner) {
				player.lastWin = false;
			}
		});
		this._winner = winner;
		await this.congratulate(winner);
	}
	
	private async congratulate (winner: Player) : Promise<void> {
		return new Promise((resolve) => {
			const	alert: Alert = new Alert(`Congratulations\n${winner.name} !\n`);
			
			this._gameWrapper.appendChild(alert.element);
			setTimeout(() => {
				this._gameWrapper.removeChild(alert.element);
				resolve();
			}, 4000);
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