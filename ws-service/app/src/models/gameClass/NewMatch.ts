import { WebSocketGameConfig } from "../../services/ws.service";
import { GameCollisionManager } from "../managers/GameCollisionManager";
import { GameMovementManager } from "../managers/GameMovementManager";
import { GamePlayerManager } from "../managers/GamePlayerManager";
import { GameSocketManager } from "../managers/GameSocketManager";
import { GameBallManager } from "../managers/GameBallManager";
import { EventEmitter } from "events";
import { Player } from "./Player";
class Observer{
	isInitialized:boolean = false;
	isStarted:boolean = false;
	isFinished:boolean = false;
	isSaved:boolean = false;
	isError:boolean = false;
	winnerId:number = -1;
	winner:Player|null = null;
}

export class Match extends EventEmitter {
	observer: Observer = new Observer();
	private _playerManager: GamePlayerManager;
	private _socketManager: GameSocketManager;
	private collisionManager: GameCollisionManager;
	private _movementManager: GameMovementManager;
	//private databaseManager: GameDatabaseManager;
	private ballManager: GameBallManager;
	private intervalId: NodeJS.Timeout | null = null;
	private isGameFinished: boolean = false;
	_gameHistoryId: number = -1;
	
	constructor(
		private lobyId: string,
		private _id: string,
		private _config: WebSocketGameConfig,

	) {
		super();
		const canvas = { //@TODO canvas size a definir dans config
			width: 800,
			height: 600,
		};
		this._playerManager = new GamePlayerManager(_config.players,_config.difficulty = 1);
		this._socketManager = new GameSocketManager();
		this.ballManager = new GameBallManager(canvas,{width:10,height:10},{x:1,y:1});
		this.collisionManager = new GameCollisionManager(canvas,this.ballManager);
		this._movementManager = new GameMovementManager(canvas);
	 // this.databaseManager = new DatabaseManager();
	}
	get gameHistoryId(): number {
		return this._gameHistoryId;
	}
	setgameHistoryId(value: number) {
		this._gameHistoryId = value;
		console.log("GameHistoryId set to", value);
	}
	get movementManager(): GameMovementManager {
		return this._movementManager;
	}
	get playerManager(): GamePlayerManager {
		return this._playerManager;
	}
	get socketManager(): GameSocketManager {
		return this._socketManager;
	}

	get id(): string {
		return this._id;
	}
	set id(value: string) {
		this._id = value;
	}
	get config(): WebSocketGameConfig {
		return this._config;
	}
	set config(value: WebSocketGameConfig) {
		this._config = value;
	}
	start() {
		//if (this.isStarted) {
		console.log("Match started [SETUPNEWGAME]",this.toJSON(),'SETUPNEWGAME');
		if (this.observer.isStarted) {
			console.log("Match already started");
			return;
		}
		this.socketManager.broadcastMessage(this.toJSON(),'SETUPNEWGAME');
		// this.emit("start"); // Émettre l'événement `start`

		// this.setPlayers();
		this.observer.isStarted = true;
		if (this.config.type === "remote") {
			this.intervalId = setInterval(() => this.update(), 1000 / 60);
		}
		else if (this.config.type === "local") {
			this.intervalId = setInterval(() => null, 1000 / 60); // = 1000/60 = 16.67ms
		}
	}

	stop(): void {
		console.log("[Match].stopp() is called stopped");
		this.observer.isFinished = true;
		this.emit("end"); // Émettre l'événement `end`
		if (this.intervalId) {
		clearInterval(this.intervalId);
		this.intervalId = null;
		}
		this.observer.isStarted = true;
		this.isGameFinished = true;
		console.log("[Match].stopp() Match stopped");
		console.log("[Match].stopp() is called stopped",this.observer);
		this.socketManager.broadcastMessage( this.observer,'STOP');
	}
	
	update () : void {
		if (this.playerManager.areAllPlayersInGame()) {
			this.movementManager.updatePlayerMovements( // @TODO passer le player manager au mouvement manager?
				this.playerManager.getPlayers(),
				this.playerManager.getPlayerActions(this.ballManager.getBall())
			);
			//	this.collisionManager.getBall().update();
			this.ballManager.getBall().update();
			this.collisionManager.handleCollisions(
				this.playerManager.getPlayers()
				// this.collisionManager.getBall()
			);
			this.socketManager.broadcastState(this.toJSON());
		} else {
			this.socketManager.broadcastMessage(
				{ type: "waiting", message: "Waiting for players to join" });
			}

		if (this.playerManager.areAllPlayersFinished()) {
		this.stop();
		this.isOver();
		}
	}
	
	isOver(): void {
		this.isGameFinished = true;
	//	this.databaseManager.saveMatchResults(this);
		console.log("Match finished");
	}


	toJSON(): any {
		return {
		id: this.id,
		lobyId: this.lobyId,
		players: this.playerManager.toJSON(),
		ball: this.ballManager.getBall(),
		config: this.config,
		canvas: this.collisionManager.canvas,//@TODO non use
		};		
	}

	viewDetails() {
		return {
			id: this.id,
			players: this.playerManager.players.map((player) => ({
				id: player.id,
				userId: player.userId,
				name: player.name,
				avatar: player.avatar,
				score: player.score,
				isInGame: player.isInGame,
				isIA: player.isIA,
				})),
			gameHistoryId: this.gameHistoryId,
			gameId: this.config.gameId,
			winner: this.observer.winner,
			//state: this.state,
			isFinished: this.observer.isFinished
		}
	}
	}