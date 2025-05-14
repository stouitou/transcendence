import { Player } from "./Player";
import { GameManager } from "./managers/GameManager";
import { Renderer } from "./managers/Renderer";
import { WebSocketManager } from "./managers/WebSocketManager";
import { StatisticsManager } from "./managers/StatisticsManager";
import { Position } from "../Interfaces/Position.interface";
import { Size } from "./Pong";

export class	Match {

	private	_isRunning: boolean = false;

	private readonly	_gameManager: GameManager | null = new GameManager();
	private readonly	_renderer: Renderer = new Renderer();
	private readonly	_webSocketManager: WebSocketManager = new WebSocketManager();
	private readonly	_statisticsManager: StatisticsManager = new StatisticsManager();
  
	constructor () {
		// Register to Web Socket events
		this._webSocketManager.on("welcometogame", (data) => console.log(data));
		this._webSocketManager.on("me", (data) => console.log(data));
		this._webSocketManager.on("state", (data) => this.updateGameStateHandler(data.game));
		this._webSocketManager.on("MESSAGE", (data) => console.log(data));
		this._webSocketManager.on("COUNTDOWN", (data) => this.renderCountdownHandler(data));
		this._webSocketManager.on("SETUPNEWGAME", (data) => this.setGameManager(data.data));	//console.log(data.data));
		this._webSocketManager.on("PREPARE_MATCHES_STARTED_ROUND", (data) =>this.renderGameHeroTreeDiv(data.data));
		this._webSocketManager.on("PREPARE_MATCHES_STARTED_ROUND_GAME", (data) => this.renderGameHeroDiv(data.data));	//envoi du match qui va debuter dans 10secondes
		this._webSocketManager.on("STOP", () => this.stop());	//signal de stop du serveur
		this._webSocketManager.on("CURRENTPHASE_UPDATE_LOBBY", (data) => console.log("[CURRENTPHASE_UPDATE_LOBBY]",data));	//phase actuelle
  	}

	get webSocketManager ()	{ return this._webSocketManager ; }

	/* ----------  Renderer getters/setters UI ---------- */
	// Transfer setters and getters from Match.ts to Renderer.ts
	setCanvas (canvas: HTMLCanvasElement)	{ this._renderer.canvas = canvas; }
	setGameUI (div: HTMLElement)			{ this._renderer.gameUi = div; }
	setGameAlert (div: HTMLElement)			{ this._renderer.gameAlert = div; }
	setGameHero (div: HTMLElement)			{ this._renderer.gameHero = div; }
	setGameHeroTree (div: HTMLElement)		{ this._renderer.gameHeroTree = div; }

	renderGameHeroDiv(data:any)		{ this._renderer.renderGameHeroDiv(data); }
	renderGameHeroTreeDiv(data:any)	{ this._renderer.renderGameHeroTreeDiv(data); }

	/* Handler utiliser par le wsocket pour le countdown initial	@param data */
	renderCountdownHandler (data: {matchId: string, value: number}) {
		console.log('renderCountdown', data.value);

		this._renderer.setupDisplay();
		this._renderer.renderCountdown(data.value);
	}

	/* Handler utiliser par le Web Socket pour metre a jour l'etat du jeu en remote	@param game */
	updateGameStateHandler (game: { ball: { position: { x: number, y: number},size: { width:number, height:number } }, players: Player[] }) {
		this._gameManager?.updateGameState(game);
	}	

	/* Setup le gameManager avec les donnees recues	@param dataMatch :DataMatch */
	setGameManager (dataMatch: DataMatch) {//@TODO: a rename en DataMatch ou setGameManagerHandler???
		//effacer les joueurs existants
		this._gameManager?.clearPlayers();
		//set le gameManager avec les donnees recues
		this._gameManager?.setDataconfig(dataMatch);
		//construire le jeux
		this._gameManager?.setupGame();
		//initialiser les graphiques
		this._renderer.setupDisplay()
		//afficher l'ui initiale: joueurs/score et terrain
		this._renderer.render(this._gameManager!.getPlayers());
		if (this._gameManager?.dataconfig?.config.type === 'remote') {
			this.attachRemoteMovementListener();//attacher les ecouteurs de mouvement 
			this.start();//remote
		}else {
			this.startLocal();
			
		}
	}

	/* Gérer les mouvements des joueurs distants	@param event */
	attachRemoteMovementListener () {
		// Listen for remote player movements
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	removeRemoteMovementListener () {
		// Remove the event listeners when not needed
		if (this._gameManager?.dataconfig && this._gameManager?.dataconfig.config.type === 'remote') {
		  document.removeEventListener('keydown', this.handleKeyDown);
		  document.removeEventListener('keyup', this.handleKeyUp);
		}
	}

	handleKeyDown = (event: KeyboardEvent) => {
		const key = event.key;
		switch (key) {
		  case 'ArrowLeft':
			this._webSocketManager.sendMoveMessage("left");
			break;
		  case 'ArrowRight':
			this._webSocketManager.sendMoveMessage("right");
			break;
		  case 'ArrowDown':
			this._webSocketManager.sendMoveMessage("down");
			break;
		  case 'ArrowUp':
			this._webSocketManager.sendMoveMessage("up");
			break;
		  default:
			console.log('Unknown key pressed:', key);
			break;
		}
	};

	handleKeyUp = (event: KeyboardEvent) => {
		const key = event.key;
		switch (key) {
		  case 'ArrowLeft':
		  case 'ArrowRight':
		  case 'ArrowDown':
		  case 'ArrowUp':
			this._webSocketManager.sendMoveMessage();
			break;
		  default:
			console.log('Unknown key pressed:', key);
			break;
		}
	}

	/**
	 * Boucle de jeu principale. Remote
	 * une simple boucle de jeu qui rend à chaque frame
	 *
	 */
	private gameLoop () {
		//return;
		if (!this._isRunning) return;
	
		// Mettre à jour la logique du jeu // en remote gerer par le serveur
		//this._gameManager!.update();
	
		// Rendre les éléments graphiques
		this._renderer.draw(this._gameManager!.getBall(), this._gameManager!.getPlayers());
	
		// Appeler la prochaine frame
		requestAnimationFrame(() => this.gameLoop());
	  }
	
	stop () {
		this._isRunning = false;
	  }

	async start () {
		if (!this._gameManager) {
			throw new Error('GameManager not initialized');
		}
	
		// Initialiser le jeu
		//  await this._gameManager.setupGame();
	
		// Démarrer la boucle de jeu
		this._isRunning = true;
		this.gameLoop();
	}

	private gameLoopLocal () {
		if (!this._isRunning) return;
	
		// Mettre à jour la logique du jeu
		this._gameManager!.update();
		
		// Rendre les éléments graphiques
		this._renderer.draw(this._gameManager!.getBall(), this._gameManager!.getPlayers());

		//verifier le score
		if (this._gameManager!.checkMaxScore(this._webSocketManager.sendMessage.bind(this._webSocketManager))) {
			this.stop();
			//afficher l'historique du jeu en fin de partie
			this._renderer.displayHistoriqueGame(this._statisticsManager, this._gameManager!.getPlayers());
		}	
	
		// Appeler la prochaine frame
		requestAnimationFrame(() => this.gameLoopLocal());
	}

	async startLocal () {
		if (!this._gameManager) {
			throw new Error('GameManager not initialized');
		}
		
		// Démarrer la boucle de jeu
		this._isRunning = true;
		this.gameLoopLocal();
	}
 }


interface WaitingPlayers {
	userId: number,
	id: number | null,
	name: string | null,
	avatar: string | null,
	state: string | null,
	// state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled",
	isInGame: boolean,
	isIA: boolean,
	position?: {
			x: number,
			y: number
		},
	size?: Size,// taille du paddle
	score?: number,
}

export type DataMatch = {
	id: string,
	lobyId: string,
	players: {
		id: number;
		name: string;
		avatar: string;
		state: string;
		isInGame: boolean;
		isIA: boolean;
		position: Position;
		size: Size;
		score: number;
		paddle: {
			position: Position;
			size: Size;
		};
	}[],
	ball: {
		position: Position
	},
	config: {
		type: string;
		format: string;
		tournamentId: string | null;
		maxPlayers: number;
		isallowedRegistration: boolean;
		gameId: string;
		state: string;
		players: WaitingPlayers[];
	}
}
