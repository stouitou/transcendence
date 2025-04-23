/* Match.ts – same game logic, modern design hooks only */

import { Player } from "./Player";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { Alert } from "./Alert";
import * as Design from "./Design";

export class Match {
	/* ---------- core state (unchanged) ---------- */
	private readonly _gameWrapper: HTMLDivElement;
	private readonly _players: Player[];

	private readonly _appendix: HTMLDivElement;
	private readonly _field: CanvasRenderingContext2D;
	private readonly _width: number;
	private readonly _height: number;
	private readonly _color: string = Design.DESIGN.fieldColor;

	private readonly _ball: Ball;

	private readonly _pointsToWin = 2;
	private _winner: Player | null = null;
	private _break = false;

	constructor(players: Player[], container: HTMLDivElement) {
		this._gameWrapper = container;
		this._players = players;
		this._appendix = document.createElement('div');
		this._appendix = Design.createAppendix();
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
			this._players[i].paddle = new Paddle(canvas, this._players[i]);
		}

		this.eventListener();
	}

	/* ---------- public API ---------- */
	public async launch(): Promise<void> {
		await this.startGame();
		this.displayScore();
		await this.displayCountdown();
		return new Promise(resolve => {
			const loop = async () => {
				/* win check */
				for (const p of this._players) {
					if (p.points === this._pointsToWin) {
						await this.endGame(p);
					//	this._gameWrapper.removeChild(this._appendix);
					//	this._gameWrapper.removeChild(this._field.canvas);
						resolve();
						return;
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
					requestAnimationFrame(loop);
				}
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
		if (this._players.length === 2)
			canvas.width = 700;
		else if (this._players.length > 2)
			canvas.width = 500;

		return canvas;
	}

	private async startGame () : Promise<void> {
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

	private run() {
		Design.drawBackground(this._field);
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
			name.style.margin = score.style.margin = "10px";
			name.style.color  = score.style.color  = Design.DESIGN.accentColor;

			/* flip‑up animate each refresh */
			Design.animateScore(score);

			if (player.location === 0) {
				player.display.style.order = "1";
				name.style.order  = "1";
				score.style.order = "0";
			} else {
				player.display.style.order = "0";
				name.style.order  = "0";
				score.style.order = "1";
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
				console.log('f = ', f);
				setTimeout(() => {
					Design.drawCountdownFrame(this._field, f);
					if (i === frames.length - 1) resolve();
				}, i * 1000);
			});
		});
	}

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

	private displayPause() {
		Design.drawPauseIcon(this._field);
	}

	private eventListener() {
		document.addEventListener("keydown", e => {
			if (e.key === " ") {
				this._break = !this._break;
				if (this._break) this.displayPause();
			}
		});
	}
}
