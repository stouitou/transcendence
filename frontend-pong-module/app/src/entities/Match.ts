import { Player } from "./Player";
import { GameManager } from "./managers/GameManager";
import { Renderer } from "./managers/Renderer";
import { WebSocketManager } from "./managers/WebSocketManager";
import { StatisticsManager } from "./managers/StatisticsManager";
import { Position } from "../Interfaces/Position.interface";
import { Size } from "./Pong";

export let CANVAS_WIDTH = 800;
export let CANVAS_HEIGHT = 600;

export class Match2 {

	private isRunning: boolean = false;

	private gameManager: GameManager | null = null;
	/* private */ renderer: Renderer;
	private _webSocketManager:WebSocketManager= new WebSocketManager();
	private statisticsManager: StatisticsManager;
  
	constructor() {
		// S'abonner aux événements WebSocket
	//	this.webSocketManager.on("setup", (data) => this.handleSetup(data));
		this.webSocketManager.on("welcometogame", (data) => console.log(data));
		this.webSocketManager.on("me", (data) => console.log(data));
		this.webSocketManager.on("state", (data) => this.updateGameStateHandler(data.game));
		this.webSocketManager.on("MESSAGE", (data) => console.log(data));
		this.webSocketManager.on("COUNTDOWN", (data) => this.renderCountdownHandler(data));
		this.webSocketManager.on("SETUPNEWGAME", (data) => this.setGameManager(data.data));//console.log(data.data));
		this.webSocketManager.on("PREPARE_MATCHES_STARTED_ROUND", (data) =>this.renderGameHeroTreeDiv(data.data));
		this.webSocketManager.on("PREPARE_MATCHES_STARTED_ROUND_GAME", (data) => this.renderGameHeroDiv(data.data));//envoi du match qui va debuter dans 10secondes
		this.webSocketManager.on("STOP", () => this.stop());//signal de stop du serveur
		this.webSocketManager.on("CURRENTPHASE_UPDATE_LOBBY", (data) => console.log("[CURRENTPHASE_UPDATE_LOBBY]",data));//phase actuelle
  
	  this.renderer = new Renderer();
	  this.statisticsManager = new StatisticsManager();
	  this.gameManager = new GameManager();
	}
	get webSocketManager() {
		return this._webSocketManager;
	}
	/* ----------  Renderer getters/setters UI ---------- */
	// on transfere les getters et setters de Match.ts vers Renderer.ts
	setCanvas(canvas: HTMLCanvasElement | null) { this.renderer.setCanvas(canvas); }
	setGameUI(div: HTMLElement | null) { this.renderer.setGameUI(div); }
	setGameAlert(div: HTMLElement | null) { this.renderer.setGameAlert(div); }
	setGameHero(div: HTMLElement | null) { this.renderer.setGamehero(div); }
	setGameHeroTree(div: HTMLElement | null) { this.renderer.setGameheroTree(div); }
	renderGameHeroDiv(data:any) {
		this.renderer.renderGameHeroDiv(data);
	}
	renderGameHeroTreeDiv(data:any) {
		this.renderer.renderGameHeroTreeDiv(data);
	}

	/**
	 * handler utiliser par le wsocket pour le countdown initial
	 * @param data 
	 */
	renderCountdownHandler(data: {matchId: string, value: number}) {

		console.log('renderCountdown', data.value);
		this.renderer.setupDisplay()
		this.renderer.renderCountdown(data.value);
	}

	/**
	 * handler utiliser par le wsocket pour metre a jour l'etat du jeu en remote
	 * @param game 
	 */
	updateGameStateHandler(game:{ball:{position: {x:number,y:number},size:{width:number,height:number}}, players: Player[]}) {
		this.gameManager?.updateGameState(game);
	}	

	/**
	 * setup le gameManager avec les donnees recues
	 * @param dataMatch :DataMatch
	 */
	setGameManager(dataMatch: DataMatch) {//@TODO: a rename en DataMatch ou setGameManagerHandler???
		//effacer les joueurs existants
		this.gameManager?.clearPlayers();
		//set le gameManager avec les donnees recues
		this.gameManager?.setDataconfig(dataMatch);
		//construire le jeux
		this.gameManager?.setupGame();
		//initialiser les graphiques
		this.renderer.setupDisplay()
		//afficher l'ui initiale: joueurs/score et terrain
		this.renderer.render(this.gameManager!.getPlayers());
		if (this.gameManager?.dataconfig?.config.type === 'remote') {
			this.attachRemoteMovementListener();//attacher les ecouteurs de mouvement 
			this.start();//remote
		}else {
			this.startLocal();
			
		}
	}
	/**
	 * Gérer les mouvements des joueurs distants
	 * @param event 
	 */
	  attachRemoteMovementListener () {
		// Listen for remote player movements
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	  }
	  removeRemoteMovementListener () {
		// Remove the event listeners when not needed
		if (this.gameManager?.dataconfig && this.gameManager?.dataconfig.config.type === 'remote') {
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
	private gameLoop() {
		//return;
		if (!this.isRunning) return;
	
		// Mettre à jour la logique du jeu // en remote gerer par le serveur
		//this.gameManager!.update();
	
		// Rendre les éléments graphiques
		this.renderer.draw(this.gameManager!.getBall(), this.gameManager!.getPlayers());
	
		// Appeler la prochaine frame
		requestAnimationFrame(() => this.gameLoop());
	  }
	
	stop() {
		this.isRunning = false;
	  }



	async start() {
		if (!this.gameManager) {
			throw new Error('GameManager not initialized');
		}
	
		// Initialiser le jeu
		//  await this.gameManager.setupGame();
	
		// Démarrer la boucle de jeu
		this.isRunning = true;
		this.gameLoop();
	}
	private gameLoopLocal() {
		if (!this.isRunning) return;
	
		// Mettre à jour la logique du jeu
		this.gameManager!.update();
		
		// Rendre les éléments graphiques
		this.renderer.draw(this.gameManager!.getBall(), this.gameManager!.getPlayers());

		//verifier le score
		if (this.gameManager!.checkMaxScore(this._webSocketManager.sendMessage.bind(this._webSocketManager))) {
			this.stop();
			//afficher l'historique du jeu en fin de partie
			this.renderer.displayHistoriqueGame(this.statisticsManager, this.gameManager!.getPlayers());
		}	
	
		// Appeler la prochaine frame
		requestAnimationFrame(() => this.gameLoopLocal());
	}

	async startLocal() {
		if (!this.gameManager) {
			throw new Error('GameManager not initialized');
		}
		
		// Démarrer la boucle de jeu
		this.isRunning = true;
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