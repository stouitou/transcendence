import { MatchManager } from "../models/managers/NewMatchManager";
//import { PhaseManager } from "../models/managers/PhaseManager";
import { PhaseManager } from "../models/managers/NewPhaseManager";
import { PlayerManager } from "../models/managers/PlayerManager";
import { SocketManager } from "../models/managers/SocketManager";
import { generateUID } from "../utils/generateUID";
import { WaitingPlayers } from "./ws.service";
import { LobbyPhase } from "../types/gameUtils.type";
import { WebSocket } from "@fastify/websocket";
import { DatabaseManager } from "../models/managers/DatabaseManager";
export const lobys = new Map<string, Loby>();


export class LobyConfig {
	config:{
		_lobyId:string,
		_type:string,//remote or local
		_format:string,//classic or tournament
	//	_mode:string,//normal or rapid ..  //@TODO a redefinir
		_tournamentId:number|null,
		_maxPlayers:number,
		_isallowedRegistration:boolean,
		_gameId:number, //@TODO a redefinir
		_state:string,
	//	_players:WaitingPlayers[],
	//	_waitingList:WaitingPlayers[]
		} = {
				_lobyId: ' ',
				_type:"local",
				_format: "classic",
			//	_mode: "normal",
				_tournamentId: null,
				_maxPlayers: 2,
				_isallowedRegistration: true,
				_gameId: -1,
				_state: "open",
				//_players: [],
				//_waitingList: [],
			};

	constructor(lobyId:string) {
		this.config._lobyId = lobyId;
	}
	get lobyId() {
		return this.config._lobyId;
	}

	/* setMode(mode: string) {
		this.config._mode = mode;
	return this;
	}
	get mode() {
	return this.config._mode;
	} */
	setFormat(format: string) {
		
	this.config._format = format == "classic" ? "classic" : "tournament";
	return this;
	}
	get format() {
	return this.config._format;
	}
	setType(type: string) {
	this.config._type = type == "local" ? "local" : "remote";
	return this;
	}
	get type() {
	return this.config._type;
	}
	setState(state: string) {
	this.config._state = state;
	return this;
	}
	get state() {
	return this.config._state;
	}
	setMaxPlayers(maxPlayers: number) {
	this.config._maxPlayers = maxPlayers;
	return this;
	}
	get maxPlayers() {
	return this.config._maxPlayers;
	}

	setIsAllowedRegistration(isallowedRegistration: boolean) {
	this.config._isallowedRegistration = isallowedRegistration;
	return this;
	}

	get isAllowedRegistration() {
	return this.config._isallowedRegistration;
	}

	
	setTournamentId(tournamentId: number) {
	this.config._tournamentId = tournamentId;
	}
	get tournamentId() {
	return this.config._tournamentId;
	}

/* 	setPlayers(players: WaitingPlayers[]) {
	this.config._players = players;
	return this;
	}
	get players() {
	return this.config._players;
	}

	setWaitingList(waitingList: WaitingPlayers[]) {
	this.config._waitingList = waitingList;
	return this;
	}
	get waitingList() {
	return this.config._waitingList;
	} */

	setgameId(gameId: number) {
	this.config._gameId = gameId;
	}
	get gameId() {
	return this.config._gameId;
	}
}

export class Loby {
	createDate = Date.now();
	private _lobyId: string = generateUID();
	private _config: LobyConfig = new LobyConfig(this._lobyId);
	private playerManagerInstance: PlayerManager = new PlayerManager();
	private socketManagerInstance: SocketManager = new SocketManager();
	private matchManagerInstance: MatchManager = new MatchManager(this._config,this.socketManagerInstance,new DatabaseManager());
	private phaseManagerInstance: PhaseManager = new PhaseManager(
		this._config,
		this.matchManagerInstance,
		this.playerManagerInstance,
		this.socketManagerInstance,
		(phaseName: string) => this.updateCurrentPhase(phaseName) // Callback
		);
  
	constructor() {
	  console.log(`Lobby created with ID ${this._lobyId}`);
	}
	get lobyId(): string {
	  return this._lobyId;
	}
	get config() {
	  return this._config;
	}
	get playerManager() {
	  return this.playerManagerInstance;
	}
	get socketManager() {
		return this.socketManagerInstance;
	}
	get matchManager() {
		return this.matchManagerInstance;
	}
	get phaseManager() {
		return this.phaseManagerInstance;
	}
	private currentPhase: string = "NotStarted";
	private updateCurrentPhase(phaseName: string): void {
		this.currentPhase = phaseName;
		console.log(`[Loby] Current phase updated to: ${phaseName}`);
	
		// Notifier tous les joueurs de la phase actuelle
		this.socketManagerInstance.broadcastMessage({ type: "PHASE_UPDATE", phase: phaseName });
	  }
	getCurrentPhase(): string {
		return this.currentPhase;
	}
  
	addPlayerToLoby(player: WaitingPlayers, socket: WebSocket): void {
/* 	  this.playerManagerInstance.addPlayer(player);
	  this.socketManagerInstance.addSocket(player.userId, socket); */
	  const existingPlayer = this.playerManagerInstance.getPlayerById(player.userId);

	  if (existingPlayer) {
		console.log(`Player ${player.userId} reconnected`);
		this.socketManagerInstance.updateSocket(player.userId, socket);
	  } else {
		console.log(`Player ${player.userId} added to lobby`);
		this.playerManagerInstance.addPlayer(player);
		this.socketManagerInstance.addSocket(player.userId, socket);
	  }
	}
	isStarted: boolean = false;

	start(id:number): void {
		this.socketManagerInstance.sendMessageDataToUser(id,this.currentPhase,'CURRENTPHASE_UPDATE_LOBBY');
			

		if (this.isStarted) {
			//@TODO: add Observer from matchManagerInstance
			console.log("Lobby already started");
			//this.socketManager.broadcastMessage(this.toJSON(),'SETUPNEWGAME');

			//get the current round from the phase manager
/* 			const currentRound = this.matchManagerInstance.round
			console.log(`[LOBY.start()] Current round: ${currentRound}`); */
			const currentMatch = this.matchManagerInstance.getCurrentMatchByUserId(id);
			//set isingame to true

			console.log(`[LOBY.start()] currentMatch: ${currentMatch}`);
			//this.socketManager.broadcastMessage(this.toJSON(),'SETUPNEWGAME');
			if (currentMatch) {
				currentMatch.playerManager.setIsInGame(id,true);//GamePlayerManager
				const playerSocket = this.socketManagerInstance.getSocket(id);
				if (playerSocket) {
					currentMatch.socketManager.addSocket(id,playerSocket);
					this.matchManager.handlePlayerReconnection(id);
				} else {
					console.log(`[LOBY.start()] Socket not found for player ID ${id}`);
				}
				console.log(`[LOBY.start()] Match found for user ID ${id} in Match  ${currentMatch.id}`);
				this.socketManagerInstance.sendMessageDataToUser(id,currentMatch.toJSON(),'SETUPNEWGAME');
			} else {
				console.log(`[LOBY.start()] No match found for user ID ${id} in round `);
			}

		return;
		}
		this.isStarted = true;	
		console.log(`Starting lobby ${this._lobyId}`);
		this.phaseManagerInstance.startPhaseLoop();
		//this.startCountdown()
/* 		this.phaseManagerInstance.transitionTo(LobbyPhase.CountdownToStart);

		 const interval = setInterval(() => {
		   const currentPhase = this.phaseManagerInstance.getPhase();
		   this.phaseManagerInstance.transitionTo(currentPhase);
		   if (currentPhase === LobbyPhase.Finished || currentPhase === LobbyPhase.Error) {
			clearInterval(interval);
	  		 }		  
		 }, 1000); */
	}

/* 	startCountdown(): void {	
	 this.phaseManagerInstance.transitionTo(LobbyPhase.CountdownToStart);
	 let count = 10;
	  const interval = setInterval(() => {
		const currentPhase = this.phaseManagerInstance.getPhase();
		if (count > 0) {
		   console.log(`Countdown: ${count}`);
		  this.socketManagerInstance.broadcast(JSON.stringify({ type: "MESSAGE", count }));
		  count--;
		} else {
			if (currentPhase === LobbyPhase.Finished) {
		 		clearInterval(interval);
			}
		  this.phaseManagerInstance.transitionTo(currentPhase);
		}
	  }, 1000);
	} */

	 // surcherge pour methode natif json
	 toJSON() {
		return {//@TODO player.toJSON()
		  lobyId: this._lobyId,		 
		  config: {
			type: this.config.type,
			format: this.config.format,
		//	mode: this.config.mode,
			tournamentId: this.config.tournamentId,
			maxPlayers: this.config.maxPlayers,
			isallowedRegistration: this.config.isAllowedRegistration,
			gameId: this.config.gameId,
			state: this.config.state,
			players: this.playerManagerInstance.getPlayers(),
			waitingList: this.playerManagerInstance.getWaitingList()
		  },
		};
	  }
  }