import { LobbyPhase } from "../../types/gameUtils.type";
import { MatchManager } from "./MatchManager";
import { LobyConfig } from "../../services/Loby";
import { WebSocketGameConfig } from "../../services/ws.service";
import { PlayerManager } from "./PlayerManager";
import { SocketManager } from "./SocketManager";
import { Match } from "../gameClass/NewMatch";

export class PhaseManager {
	round: number = 0;
	private phase: LobbyPhase = LobbyPhase.CountdownToStart;
	private interval: NodeJS.Timeout | null = null;
	private matchManager: MatchManager;
	private _config:LobyConfig
	private playerManager: PlayerManager;
	private socketManager: SocketManager
    constructor(config:LobyConfig,matchManager: MatchManager,playerManagerInstance: PlayerManager,socketManager: SocketManager) {
		this.socketManager = socketManager;
		this.matchManager = matchManager;
		this.playerManager = playerManagerInstance;
		this._config = config;
	  }
	getPhase():LobbyPhase {
	  return this.phase;
	}
	setPhase(phase: LobbyPhase): void {
		this.phase = phase;
		this.socketManager.broadcast(JSON.stringify({ type: "MESSAGE", phase: this.phase }));
	}

	//@TODO ameliorer la gestion des errreurs si besoin
	handleError(): void {
		console.error("An error occurred in the phase manager.");
		this.phase = LobbyPhase.Error;
		this.socketManager.broadcast(JSON.stringify({ type: "MESSAGE", phase: this.phase }));
	}

	transitionTo(newPhase: LobbyPhase): void {
	 // this.phase = newPhase;
	 const phaseActions: { [key in LobbyPhase]?: () => void } = {
		[LobbyPhase.CountdownToStart]: () => this.counter(),
		[LobbyPhase.MatchRunning]: () => this.phaseStartMatch(),
		[LobbyPhase.SavingResults]: () => this.phaseSetScoreMatch(),
		[LobbyPhase.WaitingForPlayers]: () => this.phaseWaitingForPlayers(),
		[LobbyPhase.Error]: () => this.handleError(),
		[LobbyPhase.NextMatch]: () => { console.log("Match finished") ;		  this.phaseNextMatch() }
	  };
	  console.log(`Transitioning to phase: ${LobbyPhase[newPhase]}`);

	  const action = phaseActions[newPhase];
	  if (action) {
		action();
	  } else {
		console.error("Unknown phase");
	  }
	/*   switch (newPhase) {
			
		case  LobbyPhase.CountdownToStart:
			this.phaseCreateMatch(this.round,null);
			this.phase = LobbyPhase.WaitingForPlayers;
			break
		case LobbyPhase.MatchRunning:
			this.matchManager.startAllMatches();
			break
		case  LobbyPhase.WaitingForPlayers:
			//@TODO: check if all players are ready
			// matchManager.observers logic
			this.phase = LobbyPhase.MatchRunning;
			break
		case LobbyPhase.SavingResults:
			this.phaseSetScoreMatch(this.round);
			break;
	  } */
	}

	startPhaseLoop(): void {
		console.log("Starting phase loop...");
		if (this.interval) {
		  console.error("Phase loop already running");
		  return;
		}
	  
		this.interval = setInterval(() => {
		  const currentPhase = this.getPhase();
		  console.log(`Current Phase: ${LobbyPhase[currentPhase]}`);
	  
		  this.transitionTo(currentPhase);

		  if (currentPhase === LobbyPhase.Finished || currentPhase === LobbyPhase.Error) {
			clearInterval(this.interval!);
			this.interval = null;
		  }
		}, 1000);
	  }
	
	  isNext:boolean = false;
	phaseNextMatch(): boolean {
		this.isNext = true;
		//is all matches finished?
		for (const match of this.matchManager.getAllMatches(0)) {
/* 			console.log("Match finished",match.observer.isFinished);
			console.log("Match finished",match.toJSON()); */
			if (!match.observer.isFinished &&this.isNext) {
				this.phase = LobbyPhase.MatchRunning;
				this.isNext = false;
				console.log("Match not finished");
				return true;
			}
		};
		this.phase = LobbyPhase.Finished;
		console.log("All matches finished");
		return false;
	}

	phaseStartMatch(): void {		
		this.matchManager.startAllMatches(0);
		this.matchManager.getAllMatches(0).forEach((match) => {
			if (match.observer.isFinished && !match.observer.isSaved) {
				console.log("[phaseStartMatch]OBSERVER Match finished ",match.observer.isFinished);
				this.phase = LobbyPhase.SavingResults;	
				return;
			}
		});


		/* if (this.matchManager.observer.isFinished) {
			console.log(`Match ${match.id} is already finished`);
			//save the match
			this.ph
		  }
		console.log("Match started"); */
	}
	
	count = 5;
	counter(): void {
		//la partie sera cree a 5 / 10 secondes
		if (this.count === 5){
			const round = 0;// this._config.round;
			this.phaseCreateMatch(round,null);
		}		
		if (this.count > 0) {
		console.log(`Countdown: ${this.count}`);
		this.socketManager.broadcast(JSON.stringify({ type: "MESSAGE", count:this.count }));
		this.count--;
		}else {			
		this.phase = LobbyPhase.WaitingForPlayers;
		this.count = 10;
		}
	}
	phaseWaitingForPlayers(): void {
		//@TODO: check if all players are ready
			// matchManager.observers logic
		this.socketManager.broadcast(JSON.stringify({ type: "MESSAGE", phase: this.phase }));
		console.log("Waiting for players...");
		this.phase = LobbyPhase.MatchRunning;
	}

	private saveMatchToDatabase(match: Match): void {
		try {
		  this.matchManager.dataBaseManager.processDataBaseCreateMatch(match);
		  console.log("Match saved to database:", match);
		} catch (error) {
		  console.error("Error saving match to database:", error);
		}
	  }

	createConfigMatch(): WebSocketGameConfig[] {
		//
		const configs:WebSocketGameConfig[] = [];
		const config:WebSocketGameConfig = {
			type: this._config.type,
			format: this._config.format,
			//mode: this.config._mode,
			tournamentId: null,
			maxPlayers: this._config.maxPlayers,
			isallowedRegistration: this._config.isAllowedRegistration,
			gameId: this._config.gameId,
			state: "playing",
			players: this.playerManager.getPlayers(),
			};
		configs.push(config);
		return configs;
	}

	/**
	 * initialise le match dans le cas d'une partie unique
	 */
	phaseCreateMatch(round:number = 0,tournamentId:number|null = null): void {
		/* const config:WebSocketGameConfig = {
			type: this._config.type,
			format: this._config.format,
			//mode: this.config._mode,
			tournamentId: null,
			maxPlayers: this._config.maxPlayers,
			isallowedRegistration: this._config.isAllowedRegistration,
			gameId: this._config.gameId,
			state: "playing",
			players: this.playerManager.getPlayers(),
			}; */
		const configs = this.matchManager.createConfigMatch(this.playerManager.getPlayers(),this._config);
		//const configs = this.createConfigMatch();
		const matches = this.matchManager.createMatchForRound(configs, this._config.lobyId);
	/* 	console.log("Match created in transition",matches);	
		for (const match of matches) {
			this.saveMatchToDatabase(match);	 
		} */
		//this.saveMatchToDatabase(match);	
	}
	phaseCreateTournament(): void {

		const config:WebSocketGameConfig = {
			type: this._config.type,
			format: this._config.format,
			//mode: this.config._mode,
			tournamentId: null,
			maxPlayers: this._config.maxPlayers,
			isallowedRegistration: this._config.isAllowedRegistration,
			gameId: this._config.gameId,
			state: "playing",
			players: this.playerManager.getPlayers(),
			};

			//on fetch
			const configs :WebSocketGameConfig[] = [];


		const matches = this.matchManager.createMatchForRound([config], this._config.lobyId);
		console.log("Tournament created");
	}
	
/* 	private saveResults(): void {
		console.log("Saving match results...");
		this.phaseSetScoreMatch(this.round);
		setTimeout(() => {
		  this.transitionTo(LobbyPhase.Finished);
		}, 3000);
	  } */

	phaseSetScoreMatch(): void {
		const round = this.round;
		console.log("Setting match score...");
	 	const matches = this.matchManager.rounds.get(round);
		if (!matches) {
			console.log("No matches found for round", round);
			return;
		}
		matches.forEach((match) => {
			if (match.observer.isFinished && !match.observer.isSaved) {
				this.matchManager.dataBaseManager.processDataBaseSaveMatchResult(match);
				match.observer.isSaved = true;
				console.log("Match score updated in transition",match);
				this.setPhase(LobbyPhase.NextMatch);
			}
		});

	/* 	const matchId = this.matchManager.rounds.get(round);
		if (!matchId) {
			console.log("No match found for round", round);
			return;
		}
		const match = this.matchManager.getMatch(matchId);
		if (!match) {
			console.log("No match found with ID", matchId);
			return;
		}
		if (match) {
			this.matchManager.dataBaseManager.processDataBaseSaveMatchResult(match);
			console.log("Match score updated in transition",match);
		} */
	}

  }