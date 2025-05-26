import { Player } from "./Player";
import { GameManager } from "./managers/GameManager";
import { Renderer } from "./managers/Renderer";
import { WebSocketManager } from "./managers/WebSocketManager";
import { StatisticsManager } from "./managers/StatisticsManager";
import { DataMatch } from "../Interfaces/DataMatch.interface";

export class	Match {

	private				_isRunning: boolean = false;

	private readonly	_gameManager: GameManager | null = new GameManager();
	private readonly	_renderer: Renderer = new Renderer();
	private readonly	_webSocketManager: WebSocketManager = new WebSocketManager();
	private readonly	_statisticsManager: StatisticsManager = new StatisticsManager();
	
	constructor () {
		// attach all contexts .bind(this) to the Match instance
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.renderCountdownHandler = this.renderCountdownHandler.bind(this);
		this.updateGameStateHandler = this.updateGameStateHandler.bind(this);
		this.setGameManager = this.setGameManager.bind(this);
		this.attachRemoteMovementListener = this.attachRemoteMovementListener.bind(this);
		this.removeRemoteMovementListener = this.removeRemoteMovementListener.bind(this);
		this.renderGameHeroDiv = this.renderGameHeroDiv.bind(this);
		this.renderGameHeroTreeDiv = this.renderGameHeroTreeDiv.bind(this);
		this.gameLoop = this.gameLoop.bind(this);
		this.gameLoopLocal = this.gameLoopLocal.bind(this);
		this.stop = this.stop.bind(this);
		this.start = this.start.bind(this);
		this.startLocal = this.startLocal.bind(this);
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

	/* ----------	Renderer getters/setters UI ---------- */
	// Transfer setters and getters from Match.ts to Renderer.ts
	setCanvas (canvas: HTMLCanvasElement)	{ this._renderer.canvas = canvas; }
	setGameUI (div: HTMLElement)			{ this._renderer.gameUi = div; }
	setGameAlert (div: HTMLElement)			{ this._renderer.gameAlert = div; }
	setGameHero (div: HTMLElement)			{ this._renderer.gameHero = div; }
	setGameHeroTree (div: HTMLElement)		{ this._renderer.gameHeroTree = div; }

	renderGameHeroDiv(data:any)		{ this._renderer.renderGameHeroDiv(data); }
	renderGameHeroTreeDiv(data:any)	{ this._renderer.renderGameHeroTreeDiv(data); }

	// Handler used by the Web Socket for initial countdown	@param data
	renderCountdownHandler (data: { matchId: string, value: number }) {
		console.log('Render Countdown', data.value);
		this._renderer.setupDisplay();
		this._renderer.renderCountdown(data.value);
	}

	// Handler used by the Web Socket to update game state in remote mode	@param game
	updateGameStateHandler (game: { ball: { position: { x: number, y: number}, size: { width:number, height:number } }, players: Player[] }) {
		this._gameManager?.updateGameState(game);
	}	

	// Setup GameManager with received datas	@param dataMatch
	setGameManager (datas: DataMatch) {//@TODO: a rename en DataMatch ou setGameManagerHandler???
		this.stop()							// stop game if running
		this._gameManager?.clearPlayers();					// clear players
		this._gameManager?.setDataconfig(datas);			// set game with received datas
		this._gameManager?.setupGame();						// setup game
		this._renderer.setupDisplay();						// initialise graphics
		this._renderer.render(this._gameManager!.players);	// display initial user interface: players, score, ground
		if (this._gameManager?.dataConfig?.config.type === 'remote') {
			this.attachRemoteMovementListener();			// attach event listeners for moves
			this.start();									// remote
		} else {
			this.startLocal();
		}
	}

	/* Manage remote players movements	@param event */
	attachRemoteMovementListener () {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	removeRemoteMovementListener () {
		if (this._gameManager?.dataConfig && this._gameManager?.dataConfig.config.type === 'remote') {
			document.removeEventListener('keydown', this.handleKeyDown);
			document.removeEventListener('keyup', this.handleKeyUp);
		}
	}

	handleKeyDown (event: KeyboardEvent) {
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
	}

	handleKeyUp (event: KeyboardEvent) {
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

	stop () {
		if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
		this._isRunning = false;
		 
	}

	start () {
		if (!this._gameManager)	{ throw new Error('GameManager not initialized') ; }
		if (this._isRunning) { return; }	// already running
		this._isRunning = true;
		this.gameLoop();
	}

	startLocal () {
		if (!this._gameManager)	{ throw new Error('GameManager not initialized') ; }
		if (this._isRunning) { return; }	// already running
		this._isRunning = true;
		this.gameLoopLocal();
	}

	// Boucle de jeu principale. Remote une simple boucle de jeu qui rend à chaque frame
	private gameLoop () {
		//return;
		if (!this._isRunning)	{ return ; }
	
		// Mettre à jour la logique du jeu // en remote gerer par le serveur
		//this._gameManager!.update();
	
		// Rendre les éléments graphiques
		this._renderer.draw(this._gameManager!.ball, this._gameManager!.players);
	
		// Appeler la prochaine frame
		 this._rafId = requestAnimationFrame(() => this.gameLoop());
	}

    private _rafId: number | null = null;
	private gameLoopLocal () {
		if (!this._isRunning) { return ; }

		// Update datas
		this._gameManager!.update();

		// Render graphic elements
		this._renderer.draw(this._gameManager!.ball, this._gameManager!.players);

		// check score
		if (this._gameManager!.checkMaxScore(this._webSocketManager.sendMessage.bind(this._webSocketManager))) {
			this.stop();
			//afficher l'historique du jeu en fin de partie
			this._renderer.displayHistoriqueGame(this._statisticsManager, this._gameManager!.players);
			return;
		}	
	
		// call next frame
		  this._rafId = requestAnimationFrame(() => this.gameLoopLocal());
	}
}
