import { Alert } from "./Alert";
import { Ball } from "./Ball";
import { Ground } from "../Interfaces/Ground.interface";
import { Limits } from "../Interfaces/Limits.interface";
import { HistoriqueGame } from "../Interfaces/HistoriqueGame.interface";
import { Paddle } from "./Paddle";
import { Player } from "./Player";
import * as Design from "./Design";

export let CANVAS_WIDTH = 700;
export let CANVAS_HEIGHT = 500;

export class Match {

	/* ---------- core state (unchanged) ---------- */
	private readonly	_gameWrapper: HTMLDivElement;

	private				_score!: HTMLDivElement;
	private				_ground!: Ground;

	private				_players: Player[];
	private				_ball!: Ball;
	private readonly	_pointsToWin = 5;

	private 			_winner: Player | null = null;

	private 			_break = false;

	/****************Partie HistoriqueGame******************/
	private				_historiqueGame: HistoriqueGame;
	private				_maxBounceCountRound = 0;

	constructor(container: HTMLDivElement) {
		this._historiqueGame = { maxBounceCount: 0, mostGoalsConcededPlayer: 0, playerWithMostPointsLost: 0, totalBouncesPerPlayer: 0};
		this._gameWrapper = container;

		this._players = [];

		this.eventListener();
	}

	/* ---------- getters ---------- */
	get	winner ()	{ return this._winner ; }

	/* ---------- public API ---------- */
	addPlayer (newPlayer: Player) {
		newPlayer.location = this._players.length;
		newPlayer.points = 0;
		this._players.push(newPlayer);
	}

	async start () : Promise<void> {
		await this.setupGame();
		await this.launchGame();

		return new Promise(resolve => {
			const loop = async () => {
				/* win check */
				for (const player of this._players) {
					if (player.points === this._pointsToWin) {
						await this.endGame(player);
						resolve();
						// TODO: Return lobby
						this.displayHistoriqueGame();
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

	/* ---------- internals ---------- */
	private async setupGame () {
		const	canvas = document.createElement('canvas') as HTMLCanvasElement;

		canvas.style.position = 'relative';
		canvas.style.margin = '0';
		canvas.style.padding = '0';
		canvas.style.border = 'none';
		canvas.style.top = '0';
		canvas.style.verticalAlign = 'top';
		canvas.height = CANVAS_HEIGHT;
		if (this._players.length > 2)
			CANVAS_WIDTH = 500;
		canvas.width = CANVAS_WIDTH;

		this._ground = {
			field: canvas.getContext('2d') as CanvasRenderingContext2D,
			width: canvas.width,
			height: canvas.height
		}

		this._score = Design.createAppendix(this._players.length - 1);
		this._gameWrapper.appendChild(this._score);

		this._gameWrapper.appendChild(canvas);
		Design.drawBackground(this._ground.field);

		this._ball = new Ball(this._ground);
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].paddle = new Paddle(this._ground, this._players[i]);
		}
	}

	private async launchGame () {
		this.displayScore();
		await this.displayStartButton();
		await this.displayCountdown();
		this._ball.spawn();
	}

	private displayScore () {
		this._players.forEach((player) => {
			const    name: HTMLParagraphElement = document.createElement('p');
            name.textContent = player.name;
            const    score: HTMLParagraphElement = document.createElement('p');
            score.textContent = `${player.points}`;
            name.style.margin = score.style.margin = '0';
            name.style.color  = score.style.color  = Design.DESIGN.accentColor;

            /* flip‑up animate each refresh */
            Design.animateScore(score);

            if (player.location === 0) {
                player.display.style.gridColumn = "3"
                player.display.style.gridRow = "2";
            } else if (player.location === 1) {
                player.display.style.gridColumn = "1";
                player.display.style.gridRow = "2";
            } else if (player.location === 2) {
                player.display.style.gridColumn = "2";
                player.display.style.gridRow = "3";
            } else if (player.location === 3) {
                player.display.style.gridColumn = "2";
                player.display.style.gridRow = "1";
            }

            player.display.appendChild(name);
            player.display.appendChild(score);
            this._score.appendChild(player.display);
		});
	}

	private async displayStartButton () : Promise<void> {
		return new Promise((resolve) => {
			
	/* ---------- internal helpers (design‑only edits) ---------- */
			let	message = `${this._players[0].name}`;
			for (let i = 1; i < this._players.length; i++) {
				message += ` vs ${this._players[i].name}`;
			}
			message += '\n';
			const	alert = new Alert(message);
			const	btn = document.createElement("button");
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
	
	private async displayCountdown(): Promise<void> {
		const frames = ["3", "2", "1", "GO"];
		return new Promise(resolve => {
			frames.forEach((f, i) => {
				setTimeout(() => {
					Design.drawCountdownFrame(this._ground.field, f);
					if (i === frames.length - 1) resolve();
				}, i * 1000);
			});
		});
	}

	private async update () {

		/* Check ball / wall collision */
		if (!this._players[2] && this._ball.coordinates.bottom >= this._ground.height ||
			!this._players[3] && this._ball.coordinates.top <= 0) {
			this._ball.direction.y *= -1;
		}

		/* Check ball out of the ground */
		else if (this._ball.out(this._players)) {
			if (!this._historiqueGame.firstPointScorer) {
				this._players.forEach((player) => {
					if (player.points === 1)	{ this._historiqueGame.firstPointScorer = player; }
				})
			}
			if (this._historiqueGame.maxBounceCount < this._ball.maxBounceCountRound) {
				this._historiqueGame.maxBounceCount = this._ball.maxBounceCountRound;
				this._ball.maxBounceCountRound = 0; }
			this._ball.spawn();
		}

		this._ball.update(this._players);
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].move(this._ball);		// check if direction key is pressed or need to move for bot
			this._players[i].paddle?.update();		// update paddle coordinates consequently
			this.defineLimits(this._players[i]);	// prevent paddles to overlap
		}
	}

	private async render () {
		Design.drawBackground(this._ground.field);
		this._ball.draw();
		for (let i = 0; i < this._players.length; i++) {
			this._players[i].paddle?.draw();
		}
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

	private defineLimits (player: Player) {
		const	paddle = player.paddle;
		if (!paddle)
			return ;
		const	margin = paddle.width + 5;

		switch (player.location) {
			case 0:
				this.setPaddleLimits(3, 'right', paddle.coordinates.top <= margin, paddle.coordinates.left, this._ground.width)
				this.setPaddleLimits(2, 'right', paddle.coordinates.bottom >= this._ground.height - margin, paddle.coordinates.left, this._ground.width)
				break ;
			case 1:
				this.setPaddleLimits(3, 'left', paddle.coordinates.top <= margin, paddle.coordinates.right, 0)
				this.setPaddleLimits(2, 'left', paddle.coordinates.bottom >= this._ground.height - margin, paddle.coordinates.right, 0)
				break ;
			case 2:
				this.setPaddleLimits(1, 'down', paddle.coordinates.left <= margin, paddle.coordinates.top, this._ground.height)
				this.setPaddleLimits(0, 'down', paddle.coordinates.right >= this._ground.width - margin, paddle.coordinates.top, this._ground.height)
				break ;
			case 3:
				this.setPaddleLimits(1, 'up', paddle.coordinates.left <= margin, paddle.coordinates.bottom, 0)
				this.setPaddleLimits(0, 'up', paddle.coordinates.right >= this._ground.width - margin, paddle.coordinates.bottom, 0)
				break ;
		}
	}

	private setPaddleLimits (
		playerIndex: number,
		side: keyof Limits,
		condition: boolean,
		valueIfTrue: number,
		valueIfFalse: number
		) {
		const	paddle = this._players[playerIndex]?.paddle;
		if (!paddle)
			return ;

		paddle.limits = { ...paddle.limits, [side]: condition ? valueIfTrue : valueIfFalse};
	}

	private eventListener() {
		document.addEventListener("keydown", e => {
			if (e.key === " ") {
				this._break = !this._break;
				if (this._break)	Design.drawPauseIcon(this._ground.field);
			}
		});

		document.addEventListener('keydown', (event) => {
			this._players.forEach((player) => { player.keyPressed.add(event.key); });
		});
		document.addEventListener('keyup', (event) => {
			this._players.forEach((player) => { player.keyPressed.delete(event.key); player.direction = null });
		});
	}

	private displayHistoriqueGame()
	{
		const menuHistoriqueGame = document.createElement('div');
		menuHistoriqueGame.style.position =  'absolute';
		menuHistoriqueGame.style.width = '250px';
		menuHistoriqueGame.style.height = '400px';
		menuHistoriqueGame.style.backgroundColor = 'blue';
		menuHistoriqueGame.style.display = 'flex';
		menuHistoriqueGame.style.justifyContent = 'center';
		menuHistoriqueGame.style.alignItems = 'center';
		menuHistoriqueGame.style.color = 'white';
		menuHistoriqueGame.style.fontSize = '15px';
		menuHistoriqueGame.style.fontFamily = 'Arial';
		menuHistoriqueGame.style.borderRadius = '8px';
		menuHistoriqueGame.style.border = '5px solid rgb(255, 0, 0)';
		menuHistoriqueGame.style.background = 'rgb(0, 0, 0)';
		menuHistoriqueGame.style.color = 'rgb(255, 0, 0)';
		menuHistoriqueGame.style.whiteSpace = 'pre-line';
		let text: string = 'Le plus grand nombre de rebonds ' + this._historiqueGame.maxBounceCount + "\n\n";
		let mostGoalsConcededPlayer: number = 0;
		let playerWithMostPointsLost: number = 0;

		for (let x: number = 0; x < this._players.length; x++)
		{
			console.log("this._players[x].historiqueGame.firstPointScorer ", this._players[x].historiqueGame.firstPointScorer?.name);
			if (this._players[x].historiqueGame.mostGoalsConcededPlayer > this._players[mostGoalsConcededPlayer].historiqueGame.mostGoalsConcededPlayer)
				mostGoalsConcededPlayer = x;
			if (this._players[x].historiqueGame.playerWithMostPointsLost > this._players[playerWithMostPointsLost].historiqueGame.playerWithMostPointsLost)
				playerWithMostPointsLost = x;
			if (this._players[x].historiqueGame.firstPointScorer)
				text += "Le premier joueur à avoir marqué un point est " + this._players[x].name + "\n\n";
		}
		text += " Le joueur qui s'est pris le plus de buts " + this._players[mostGoalsConcededPlayer].name + " avec " + this._players[mostGoalsConcededPlayer].historiqueGame.mostGoalsConcededPlayer + "\n\n";
		text += "Le joueur ayant perdu le plus de points " + this._players[playerWithMostPointsLost].name + " avec " + this._players[playerWithMostPointsLost].historiqueGame.playerWithMostPointsLost + "\n\n";
		
		for (let x: number = 0; x < this._players.length; x++)
		{
			text += "Nombre de rebond de " + this._players[x].name + " est de " + this._players[x].historiqueGame.totalBouncesPerPlayer + "\n";
		}
		menuHistoriqueGame.textContent = text;
		this._gameWrapper.appendChild(menuHistoriqueGame);
		}
}
