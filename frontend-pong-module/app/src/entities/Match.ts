/* Match.ts – same game logic, modern design hooks only */

import { Player } from "./Player";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { Alert } from "./Alert";
import * as Design from "./Design";

export let CANVAS_WIDTH  = 700;
export let CANVAS_HEIGHT = 500;

export class Match {

	/* ---------- core state (unchanged) ---------- */
	private readonly	_gameWrapper: HTMLDivElement;

	private readonly	_appendix: HTMLDivElement;
	private readonly	_canvas: HTMLCanvasElement;
	private readonly	_field: CanvasRenderingContext2D;
	private readonly	_width: number;
	private readonly	_height: number;
	// private readonly	_color: string = Design.DESIGN.fieldColor;

	private				_ball!: Ball;
	private				_players: Player[] = [];

	private readonly	_pointsToWin = 2;
	private 			_winner: Player | null = null;
	private 			_break = false;

	constructor(container: HTMLDivElement) {
		this._gameWrapper = container;
		this._appendix = Design.createAppendix();
		this._gameWrapper.appendChild(this._appendix);

		this._canvas = this.createCanvas()!;
		this._field = this._canvas.getContext('2d') as CanvasRenderingContext2D;
		this._width = this._canvas.width;
		this._height = this._canvas.height;
		this._gameWrapper.appendChild(this._canvas);

		this.eventListener();
	}

	/* ---------- public API ---------- */
	addPlayer (newPlayer: Player) {
		this._players.push(newPlayer);
	}

	async start () : Promise<void> {
		await this.setupGame();
		await this.beforeGame();

		return new Promise(resolve => {
			const loop = async () => {
				/* win check */
				for (const player of this._players) {
					if (player.points === this._pointsToWin) {
						await this.endGame(player);
						resolve();
						return;
					}
				}

				if (!this._break) {
					await this.update();
					await this.render();
				}
				requestAnimationFrame(loop);
			};
			loop();
		});
	}

	private createCanvas () {
		const	canvas: HTMLCanvasElement = document.createElement('canvas');

		canvas.style.position = 'relative';
		canvas.style.margin = '0';
		canvas.style.padding = '0';
		canvas.style.border = 'none';
		canvas.style.top = '0';
		canvas.style.verticalAlign = 'top';
		canvas.height = 500;
		if (this._players.length > 2)
			CANVAS_WIDTH = 500;
		canvas.width = CANVAS_WIDTH;

		return canvas;
	}

	private async setupGame () {
		this._ball = new Ball(this._canvas);
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].location = i;
			this._players[i].points = 0;
			this._players[i].paddle = new Paddle(this._canvas, this._players[i]);
		}
	}

	private async beforeGame () {
		await this.displayStartButton();
		this.displayScore();
		await this.displayCountdown();
	}

	private async displayStartButton () : Promise<void> {
		return new Promise((resolve) => {
			
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
	/* ---------- internal helpers (design‑only edits) ---------- */
			const alert = new Alert(`${this._players[0].name}\nvs\n${this._players[1].name}\n`);
			const btn = document.createElement("button");
			Design.styleStartButton(btn);
			btn.textContent = "Start";
			btn.onclick = () => {
				this._gameWrapper.removeChild(alert.element);
				resolve();
			};
			alert.element.appendChild(btn);
			this._gameWrapper.appendChild(alert.element);
		});
	}

	private displayScore () {
		this._players.forEach((player) => {
			const	name: HTMLParagraphElement = document.createElement('p');
			name.textContent = player.name;
			name.style.margin = '10px';
			const	score: HTMLParagraphElement = document.createElement('p');
			score.textContent = `${player.points}`;
			name.style.margin = score.style.margin = "10px";
			name.style.color  = score.style.color  = Design.DESIGN.accentColor;
			
			/* flip‑up animate each refresh */
			Design.animateScore(score);
			
			if (player.location === 0) {
				player.display.style.gridRow = "2";
				player.display.style.order = "1";
				name.style.order  = "1";
				score.style.order = "0";
			} else if (player.location === 1) {
				player.display.style.gridRow = "2";
				player.display.style.order = "0";
				name.style.order  = "0";
				score.style.order = "1";
			} else if (player.location === 2) {
				player.display.style.gridRow = "3";
				player.display.style.order = "0";
				name.style.order  = "0";
				score.style.order = "1";
			} else if (player.location === 3) {
				player.display.style.gridRow = "1";
				player.display.style.order = "0";
				name.style.order  = "1";
				score.style.order = "0";
			}
			
			player.display.appendChild(name);
			player.display.appendChild(score);
			this._appendix.appendChild(player.display);
		});
	}
	
	private async displayCountdown(): Promise<void> {
		const frames = ["3", "2", "1", "GO"];
		return new Promise(resolve => {
			frames.forEach((f, i) => {
				setTimeout(() => {
					Design.drawCountdownFrame(this._field, f);
					if (i === frames.length - 1) resolve();
				}, i * 1000);
			});
		});
	}

	private async update () {

		this._players.forEach((player) => player.paddle!.collision(this._ball))
		
		if (!this._players[2] && this._ball.y + this._ball.radius >= this._height ||
			!this._players[3] && this._ball.y - this._ball.radius <= 0) {
				this._ball.direction.y *= -1;
			}
			else if (this._ball.out(this._players)) {
				this._ball.spawn();
			}

		this._ball.update();
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].paddle?.update(this._ball);
		}
	}

	private async render () {
		Design.drawBackground(this._field);
		this._ball.draw();
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].paddle?.draw();
		}
	}

	// private run() {
	// 	Design.drawBackground(this._field);
	// 	this._ball.move();
	// 	for (let i = 0; i < this._players.length; i++) {
	// 		this._players[i].paddle!.move(this._players[i], this._ball);
	// 	}
	// }

	private async endGame(winner: Player): Promise<void> {
		winner.lastWin = true;
		this._players.forEach(p => (p.lastWin = p === winner));
		this._winner = winner;
		await this.congratulate(winner);
	}

	private async congratulate(winner: Player): Promise<void> {
		return new Promise(resolve => {
			const alert = new Alert(`Congratulations\n${winner.name} !\n`);
			this._gameWrapper.appendChild(alert.element);
			setTimeout(() => {
				this._gameWrapper.removeChild(alert.element);
				resolve();
			}, 4000);
		});
	}

	private eventListener() {
		document.addEventListener("keydown", e => {
			if (e.key === " ") {
				this._break = !this._break;
				if (this._break)	Design.drawPauseIcon(this._field);
			}
		});
	}
}
