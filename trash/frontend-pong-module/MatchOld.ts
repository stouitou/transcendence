import { Alert } from "../entities/Alert";
import { Ball } from "../entities/Ball";
import { Ground } from "../Interfaces/Ground.interface";
import { Limits } from "../Interfaces/Limits.interface";
import { HistoriqueGame } from "../Interfaces/HistoriqueGame.interface";
import { Paddle } from "../entities/Paddle";
import { Player } from "../entities/Player";
import * as Design from "../entities/Design";

export let CANVAS_WIDTH = 700;
export let CANVAS_HEIGHT = 500;

// Match gere trop de responsabilites : 
// -rendu,
// -logique de jeu,
// - gestion des joueurs,
// - gestion de la balle,
// - gestion des scores
// - gestion des evenements utilisateur
// - gestion des bots
// - gestion des etats de jeu
// - gestion de l'historique du jeu
// - gestion des limites de la raquette
// - gestion des animations
// -> On pourrait diviser le code en plusieurs classes ou modules pour mieux organiser la logique de jeu.
// -Gestionnaire des entités : 
// -Gestionnaire du jeu : GameManager (logique principale du jeu).
// -Gestionnaire du rendu : Renderer
// -Gestionnaire des événements : InputManager
// -Gestionnaire de l'historique :
// -Gestionnaire WebSocket :WebSocketManager


export class Match2 {
	//private _dataConfig?:DataMatch;
	/* ---------- render div (unchanged) ---------- */

    private _gameCanvas : HTMLCanvasElement | null = null;
    private _gameDivUi : HTMLElement | null = null;
    private _gameDivAlert : HTMLElement | null = null;

	/* ---------- core state (unchanged) ---------- */
	//private readonly	_gameWrapper: HTMLDivElement;

	private				_score!: HTMLDivElement;
	private				_ground!: Ground;

	private				_players: Player[];
	private				_ball!: Ball;
	private readonly	_pointsToWin = 10;

	private 			_winner: Player | null = null;

	private 			_break = false;

	/****************Partie HistoriqueGame******************/
	private				_historiqueGame: HistoriqueGame;
	private				_maxBounceCountRound = 0;

	constructor(/* container: HTMLDivElement */) {
		this._historiqueGame = { maxBounceCount: 0, mostGoalsConcededPlayer: 0, playerWithMostPointsLost: 0, totalBouncesPerPlayer: 0};
		//this._gameWrapper = container;

		this._players = [];

		this.eventListener();
	}
	/* ---------- getters/setters UI ---------- */
	get gameCanvas () : HTMLCanvasElement | null {
		return this._gameCanvas;
	}
	setCanvas(canvas: HTMLCanvasElement | null) {
		this._gameCanvas = canvas;
	}
	get gameDivUi () : HTMLElement | null {
		return this._gameDivUi;
	}
	setGameUI(div: HTMLElement | null) {
		this._gameDivUi = div;
	}
	get gameDivAlert () : HTMLElement | null {
		return this._gameDivAlert;
	}
	setGameAlert(div: HTMLElement | null) {
		this._gameDivAlert = div;
	}

/* 	get dataConfig () : DataMatch | undefined {
		return this._dataConfig;
	}
	setDataConfig(data: DataMatch) {
		this._dataConfig = data;
	} */


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

	/* ---------- setup game ---------- */
	/* -----------setup inital Display */
	setupDisplay () {
		const	canvas = this._gameCanvas//document.createElement('canvas') as HTMLCanvasElement;
		if (!canvas) {
			throw new Error('Game canvas not found');
		}
		/* canvas.style.position = 'relative';
		canvas.style.margin = '0';
		canvas.style.padding = '0';
		canvas.style.border = 'none';
		canvas.style.top = '0'; */
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

		this._score.style.width = '100%';
		this._score.style.height = '100%';
		this._gameDivUi!.innerHTML = '';
		this._gameDivUi?.appendChild(this._score);

		Design.drawBackground(this._ground.field);
	}

	private async setupGame () {
		//* setup players */

		//* setup game Display */
		this.setupDisplay();
		//* setup Ball */
		this._ball = new Ball(this._ground);
		//* setup Players */
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
			name.classList.add('score-cell');
			name.style.padding = '0';
            const    score: HTMLParagraphElement = document.createElement('p');
            score.textContent = `${player.points}`;
			score.classList.add('score-cell');
			score.style.padding = '0 20px';

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
				this._gameDivAlert?.removeChild(alert.element);
				this._gameDivAlert?.classList.remove('show');
				resolve();
			};
			alert.element.appendChild(btn);
			this._gameDivAlert?.appendChild(alert.element);
			this._gameDivAlert?.classList.add('show');
			//this._gameDivAlert?.appendChild(alert.element);
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
		this._ball.alreadyBouncedThisFrame = false;

		/* Check ball / wall collision */
		if (!this._players[2] && this._ball.coordinates.bottom >= this._ground.height ||
			!this._players[3] && this._ball.coordinates.top <= 0) {
			this._ball.alreadyBouncedThisFrame = true;
			this._ball.direction.y *= -1;
			const	offset = this._ball.radius + 0.1;
			this._ball.position.x += this._ball.direction.x * offset;
			this._ball.position.y += this._ball.direction.y * offset;
		}

		/* Check ball out of the ground */
		if (this._ball.out(this._players)) {
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
			this._gameDivAlert?.appendChild(alert.element);
			this._gameDivAlert?.classList.add('show');
			setTimeout(() => {
				this._gameDivAlert?.removeChild(alert.element);
				this._gameDivAlert?.classList.remove('show');
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
		this._gameDivAlert?.appendChild(menuHistoriqueGame);
		this._gameDivAlert?.classList.add('show');
		}
}


/*

// DRY : D'ont Repeat Yourself
// Le principe DRY (Don't Repeat Yourself) est un principe de développement logiciel qui vise à réduire la duplication de code.
// Il stipule que chaque élément de connaissance dans un système doit avoir une représentation unique, sans duplication.
// En d'autres termes, le code doit être écrit de manière à éviter la répétition inutile d'informations ou de logique.
// Le principe DRY est important car il permet de rendre le code plus modulaire, plus facile à maintenir et à comprendre.
// En appliquant ce principe, les développeurs peuvent réduire le risque d'erreurs, faciliter les modifications et améliorer la lisibilité du code.
// En pratique, cela signifie que les développeurs doivent chercher à créer des abstractions, des fonctions réutilisables et des classes qui encapsulent la logique commune.
// SRP : Single Responsibility Principle
// Le principe de responsabilité unique (SRP) est un principe de conception de logiciels qui stipule qu'une classe ne doit avoir qu'une seule raison de changer.
// En d'autres termes, une classe doit être responsable d'une seule fonctionnalité ou d'un seul aspect du système. Cela signifie que chaque classe doit avoir une seule responsabilité et que toutes ses fonctionnalités doivent être étroitement liées à cette responsabilité.
// Le principe de responsabilité unique est l'un des cinq principes SOLID de la programmation orientée objet, qui visent à rendre le code plus modulaire, flexible et facile à maintenir.
// Le principe de responsabilité unique est important car il permet de réduire la complexité du code, d'améliorer la lisibilité et de faciliter les tests unitaires. En séparant les responsabilités en différentes classes, il devient plus facile de comprendre le code, de le modifier et de le tester.
// Le principe de responsabilité unique est souvent associé à d'autres principes de conception, tels que le principe de séparation des préoccupations (Separation of Concerns) et le principe de l'inversion des dépendances (Dependency Inversion Principle).
// Le principe de responsabilité unique est un principe de conception de logiciels qui stipule qu'une classe ne doit avoir qu'une seule raison de changer.
// SOLID :
// -S : Single Responsibility Principle (SRP) : Une classe doit avoir une seule responsabilité.
// -O : Open/Closed Principle (OCP) : Une classe doit être ouverte à l'extension mais fermée à la modification.
 //     -OCP c'est a dire que les classes doivent être conçues de manière à pouvoir être étendues sans avoir à modifier le code existant.
// -L : Liskov Substitution Principle (LSP) : Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans affecter le comportement du programme.
//       -LSP c'est à dire que les classes dérivées doivent être substituables à leurs classes de base sans altérer le comportement du programme.
// -I : Interface Segregation Principle (ISP) : Une classe ne doit pas être forcée d'implémenter des interfaces qu'elle n'utilise pas.
 //        -ISP c'est à dire que les interfaces doivent être spécifiques à un client et ne pas forcer les classes à implémenter des méthodes qu'elles n'utilisent pas.
// -D : Dependency Inversion Principle (DIP) : Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau, mais plutôt des abstractions.
//       -DIP c'est à dire que les modules de haut niveau ne doivent pas dépendre des modules de bas niveau, mais plutôt des abstractions.
//         par exemple, une classe de haut niveau qui utilise une classe de bas niveau doit dépendre d'une interface ou d'une classe abstraite plutôt que de la classe de bas niveau elle-même.

*/