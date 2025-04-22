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
	private readonly _paddles: Paddle[] = [];

	private readonly _pointsToWin = 2;
	private _winner: Player | null = null;
	private _break = false;

	constructor(players: Player[], container: HTMLDivElement) {
		this._gameWrapper = container;
		this._players = players;
		this._players.forEach((p, i) => {
			p.location = i;
			p.points = 0;
		});

		/* ---------- presentation scaffolding ---------- */
		this._appendix = Design.createAppendix();
		this._gameWrapper.appendChild(this._appendix);

		const canvas = Design.createGameCanvas(players);
		this._field = canvas.getContext("2d") as CanvasRenderingContext2D;
		this._width = Design.CANVAS_WIDTH;
		this._height = Design.CANVAS_HEIGHT;
		this._gameWrapper.appendChild(canvas);

		/* ---------- game objects ---------- */
		this._ball = new Ball(canvas);
		for (let i = 0; i < this._players.length; i++)
			this._paddles[i] = new Paddle(canvas, i, players[i].role);

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
						this._gameWrapper.removeChild(this._appendix);
						this._gameWrapper.removeChild(this._field.canvas);
						resolve();
						return;
					}
				}

				if (!this._break) {
					this.run();
					this._paddles.forEach(pad => pad.collision(this._ball));

					/* wall bounce for 2‑player mode */
					if (
						(!this._players[2] && this._ball.y + this._ball.radius >= this._height) ||
						(!this._players[3] && this._ball.y - this._ball.radius <= 0)
					) {
						this._ball.direction.y *= -1;
					} else if (this._ball.out(this._players)) {
						this._ball.spawn();
					}
				}
				requestAnimationFrame(loop);
			};
			loop();
		});
	}

	/* ---------- internal helpers (design‑only edits) ---------- */
	private async startGame(): Promise<void> {
		return new Promise(resolve => {
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
		this._paddles.forEach((p, i) => p.move(this._players[i], this._ball));
	}

	private displayScore() {
		this._players.forEach(player => {
			const name  = document.createElement("p");
			const score = document.createElement("p");

			name.textContent  = player.name;
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
