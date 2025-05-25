import { WaitingPlayers, WebSocketGameConfig } from "../../services/ws.service";
import { Match } from "../gameClass/NewMatch";
import { generateUID } from "../../utils/generateUID";
import { LobyConfig } from "../../services/Loby";
import { SocketManager } from "./SocketManager";
import { DatabaseManager, GameHistoryPlayer } from "./DatabaseManager";
export class RoundManager {
	private rounds: Map<number, Map<string, Match>> = new Map();
	currentRound: number = 0;
  
	addMatch(round: number, match: Match): void {
	  if (!this.rounds.has(round)) {
		this.rounds.set(round, new Map<string, Match>());
	  }
	  this.rounds.get(round)?.set(match.id, match);
	}
  
	getMatch(round: number, matchId: string): Match | undefined {
	  return this.rounds.get(round)?.get(matchId);
	}
  
	getAllMatches(round: number): Match[] {
	  return Array.from(this.rounds.get(round)?.values() || []);
	}
  
	allMatchesAreOver(round: number): boolean {
	  const matches = this.rounds.get(round);

	  if (!matches) {console.log(`[RoundManager] allMatchesAreOver no match`);return true};
	  console.log(`[RoundManager] allMatchesAreOver ${round} matches:`, Array.from(matches.values()).map((match) => match.observer));
	  console.log(`[RoundManager] allMatchesAreOver ${round} matches:`, Array.from(matches.values()).map((match) => match.observer));
	  return Array.from(matches.values()).every((match) => match.observer.isFinished);
	}
  
	forceStopAllMatches(round: number): void {
	  const matches = this.rounds.get(round);
	  matches?.forEach((match) => match.stop());
	}

	getMatchByUserId(userId: number,round:number): Match | null {
		// Check if the match exists in the rounds map
		const matches = this.getAllMatches(round);
		if (matches) {
			for (const match of matches.values()) {
				const player = match.playerManager.isPlayer(userId);
				if (player) {
					return match;
				}
			}
		}
		return null;
	}
	getCurrentMatchByUserId(userId: number): Match | null {
		// Check if the match exists in the rounds map
		const matches = this.getAllMatches(this.currentRound);
		if (matches) {
			for (const match of matches.values()) {
				const player = match.playerManager.isPlayer(userId);
				if (player) {
					return match;
				}
			}
		}
		return null;
	}

	getAllMatchesinAllRound(): {round:number, matches: Partial<Match>[]}[] {
		const allMatches: {round:number, matches: Partial<Match>[]}[] = [];

		this.rounds.forEach((matches, round) => {
			allMatches.push({round:round, matches: Array.from(matches.values())
				.map((match) => match.viewDetails())
			});
		});
		return allMatches;
	}
  }
export class LocalMatchQueue {
	private queue: Match[] = [];
	private isProcessing: boolean = false;
  
	addMatch(match: Match): void {
	  this.queue.push(match);
	}
  
	//async processQueue(startMatchAsync: (match: Match) => Promise<void>): Promise<void> {
	async processQueue(
		startMatchAsync: (match: Match) => Promise<void>,
		beforeMatchCallback?: (match: Match) => Promise<void>
		): Promise<void> {
	  console.log("[LocalMatchQueue] Processing queue");
	  if (this.queue.length === 0) {
		console.log("[LocalMatchQueue] Queue is empty");
		return;
	  }
	  if (this.isProcessing) return;
  
	  this.isProcessing = true;
	  while (this.queue.length > 0) {
		const match = this.queue.shift();
		if (match) {
		  console.log(`[LocalMatchQueue] Starting match ${match.id}`);
		   // Appeler le callback avant de démarrer le match (compte à rebours)
		   if (beforeMatchCallback) {
			await beforeMatchCallback(match);
		  }
		  await startMatchAsync(match);
		  console.log(`[LocalMatchQueue] Match ${match.id} finished`);
		}
	  }
	  this.isProcessing = false;
	  console.log("[LocalMatchQueue] All matches processed");
	}
  }
export class TournamentManager {
	constructor(private databaseManager: DatabaseManager) {}
  
	async createTournament(config: WebSocketGameConfig, lobyId: string): Promise<Match[]> {
		try {
			const { tournament, games } = await this.databaseManager.processDataBaseCreateTournament(config, lobyId); 
		
			if (!tournament || !games) {
				console.error("Error creating tournament: No tournament or games found");
				throw new Error("No matches were created");
				return [];
			}
		
			return games.map((game) => {
				const matchConfig: WebSocketGameConfig = {
					type: game.type,
					format: game.format,
					tournamentId: tournament.id,
					maxPlayers: game.max_players,
					isallowedRegistration: true,
					gameId: game.id,
					state: tournament.state,
					players: game.gameHistory.players.map((player) => ({
							userId: player.user?.id ?? -1,
							id: player.id,
							name: player.display_name,
							avatar: player.avatar,
							state: "joined",
							isInGame: true,
							isIA: player.is_IA,
						})),
					};
			const match = new Match(lobyId, generateUID(), matchConfig);
			match.setgameHistoryId(game.gameHistory.id);
			console.log(`[TournamentManager] Match created with ID: ${match.id} and game ID: ${game.id}/ gameHistoryID: ${game.gameHistory} for tournament ${tournament.id}`);
			
			return match;

			});
		} catch (error) {
			console.error(`[TournamentManager] Error creating tournament: ${error}`);
			throw error; // Relancer l'erreur pour la propager
		}
	}



	async createTournamentNextRound(lobyId: string): Promise<{matches:Match[], winner:GameHistoryPlayer|null}> {
		const { tournament, games } = await this.databaseManager.processDataBaseGenerateNextRoundTournament();
		if (!tournament) {
			console.error("Error creating tournament: No tournament or games found");
			return {matches:[], winner:null};
		  }
		  if (!games) {
			console.error("Error creating tournament: No tournament or games found");
			return {matches:[], winner:tournament.winner};
		  }
	  
		  const createdGames = games.filter((game)=>game.currentRound === 1 ).map((game) => {//@BUG //@TODO a rendre dynamique
			const matchConfig: WebSocketGameConfig = {
			  type: game.type,
			  format: game.format,
			  tournamentId: tournament.id,
			  maxPlayers: game.max_players,
			  isallowedRegistration: false,
			  gameId: game.id,
			  state: tournament.state,
			  players: game.gameHistory.players.map((player) => ({
				userId: player.user?.id ?? -1,
				id: player.id,
				name: player.display_name,
				avatar: player.avatar,
				state: "joined",
				isInGame: true,
				isIA: player.is_IA,
			  })),
			};
			const match= new Match(lobyId, generateUID(), matchConfig);			
			match.setgameHistoryId(game.gameHistory.id);
			
			return match

		  });
		  return {matches:createdGames, winner:tournament.winner};
	}
  }

/*   export class MatchSocketManager {
	constructor(private socketManager: SocketManager) {}
  
	attachSockets(match: Match, isLocal: boolean): void {
	  if (isLocal) {
		// Un seul socket pour tous les joueurs en local
		const localSocket = this.socketManager.getLocalSockets();
		if (localSocket) {
		  match.playerManager.players.forEach((player) => {
			match.socketManager.addSocket(player.userId, localSocket);
		  });
		  console.log(`[MatchSocketManager] Attached local socket to all players in match ${match.id}`);
		} else {
		  console.error(`[MatchSocketManager] No local socket found for match ${match.id}`);
		}
	  } else {
		// Un socket par joueur en remote
		match.playerManager.players.forEach((player) => {
		  const socket = this.socketManager.getSocket(player.userId);
		  if (socket) {
			match.socketManager.addSocket(player.userId, socket);
			console.log(`[MatchSocketManager] Attached socket for player ${player.userId} in match ${match.id}`);
		  } else {
			console.error(`[MatchSocketManager] No socket found for player ${player.userId} in match ${match.id}`);
		  }
		});
	  }
	}
  
	handleReconnection(match: Match, userId: number): void {
	  const socket = this.socketManager.getSocket(userId);
	  if (socket) {
		match.socketManager.addSocket(userId, socket);
		console.log(`[MatchSocketManager] Reattached socket for player ${userId} in match ${match.id}`);
	  } else {
		console.error(`[MatchSocketManager] No socket found for reconnected player ${userId} in match ${match.id}`);
	  }
	}
  } */

export class MatchManager {
	/* private */ roundManager: RoundManager = new RoundManager();
	/* private */ localMatchQueue: LocalMatchQueue = new LocalMatchQueue();
	private tournamentManager: TournamentManager;
	//private matchSocketManager: MatchSocketManager;
  
	constructor(public lobyConfig: LobyConfig, private socketManager: SocketManager, private databaseManager: DatabaseManager) {
	  this.tournamentManager = new TournamentManager(databaseManager);
	  //this.matchSocketManager = new MatchSocketManager(socketManager);
  
	}
  
	createConfigMatch(players:WaitingPlayers[],lobyConfig:LobyConfig): WebSocketGameConfig[] {
		//
		const configs:WebSocketGameConfig[] = [];
		const config:WebSocketGameConfig = {
			type: lobyConfig.type,
			format: lobyConfig.format,
			//mode: this.config._mode,
			tournamentId: null,
			maxPlayers: lobyConfig.maxPlayers,
			isallowedRegistration: lobyConfig.isAllowedRegistration,
			gameId: lobyConfig.gameId,
			state: "playing",
			players: players,
			};
		configs.push(config);
		return configs;
	}
	async createMatches(configs: WebSocketGameConfig[], lobyId: string): Promise<void> {
		if (configs[0].format === "classic") {
			const matches = this.createMatchesForRound(configs, lobyId);
			for (const match of matches) {
				try {
					await this.databaseManager.processDataBaseCreateMatch(match);
					console.log("Match saved to database:", match);
				} catch (error) {
					console.error("[MatchManager][catch]createMatches Error saving match to database:", error);
					throw error;
				};	
			}
		}
		else if (configs[0].format === "tournament") {
			try {
			const tournamentCongig =await this.createTournament(configs[0], lobyId);
				return tournamentCongig;
			} catch (error) {
				console.error("[MatchManager][catch]createMatches Error createTournament:", error);
				throw error.message;
			};	
		}
		  /* for (const config of configs) {
			const match = new Match(lobyId, generateUID(), config);
			this.roundManager.addMatch(round, match);

		  } */
		 // return new Promise((resolve) => {	resolve(); });
	  
		 // await this.localMatchQueue.processQueue(this.startMatchAsync.bind(this));
	}

	createMatchesForRound(configs: WebSocketGameConfig[], lobyId: string): Match[] {
		const round = this.roundManager.currentRound;
		const matches:Match[] = [];
		for (const config of configs) {
			const match = new Match(lobyId, generateUID(), config);
			this.roundManager.addMatch(round, match);
			matches.push(match);
			if (config.type === "local") {
				 this.localMatchQueue.addMatch(match);
			}
	  }
	  return matches
	}
  
	async createTournament(config: WebSocketGameConfig, lobyId: string): Promise<void> {
	
		try {
			const matches = await this.tournamentManager.createTournament(config, lobyId);
			console.log(`[MatchManager]createTournament() Tournament created with ${matches.length} matches`);
			matches.forEach((match) => this.roundManager.addMatch(this.roundManager.currentRound, match));
			if (this.lobyConfig.config._type === "local") {
				//this.localMatchQueue.addMatch(matches[0]);
				matches.forEach((match) => {
				this.localMatchQueue.addMatch(match)
				});
			}
		} catch (error) {
			console.error(`[MatchManager]createTournament() Error creating tournament: ${error}`);
			throw new Error(`Failed to create a Tournament: ${error.message}`);;
		}
	}
	async createTournamentNextRound(/* config: WebSocketGameConfig,  */lobyId: string): Promise<GameHistoryPlayer | null> {
		const {matches, winner} = await this.tournamentManager.createTournamentNextRound(lobyId);
		if (winner) {
			console.log(`[MatchManager] Tournament finished, winner: ${winner}`);
			return winner;
		}
		if (matches.length === 0) {
			console.error("Error creating tournament: No matches found");
			return null;
		}
		this.roundManager.currentRound++;
		matches.forEach((match) => this.roundManager.addMatch(this.roundManager.currentRound, match));
		if (this.lobyConfig.config._type === "local") {
		  //this.localMatchQueue.addMatch(matches[0]);
		  matches.forEach((match) => {
			this.localMatchQueue.addMatch(match)
		  });
		  }
		return null;
	  }

	  async startAllMatchesRemote(
		round: number,
		beforeMatchCallback?: (match: Match) => Promise<void>
	  ): Promise<void> {
		console.log(`[MatchManager] Starting all remote matches for round ${round}`);
	  
		const matches = this.roundManager.getAllMatches(round);
		if (matches.length === 0) {
		  console.log(`[MatchManager] No remote matches found for round ${round}`);
		  return;
		}
	  
		// Démarrer tous les matchs remote en parallèle
		const matchPromises = matches.map(async (match) => {
		  if (beforeMatchCallback) {
			await beforeMatchCallback(match); // Exécuter le callback avant chaque match
		  }
		await  this.startMatchAsync(match); // Démarrer le match
		});
	  
		await Promise.all(matchPromises); // Attendre que tous les matchs soient démarrés
	  
		console.log(`[MatchManager] All remote matches for round ${round} have been started`);
	  }

	async startAllMatches(round: number): Promise<boolean> {
		console.log(`[MatchManager] Match sync startAllMatches ${round} type: ${this.lobyConfig.config._type}`);
			
		if (this.lobyConfig.config._type === "remote") {
			return new Promise((resolve) => {
				const matches = this.roundManager.getAllMatches(round);
				if (matches) {
					matches.forEach((match) => {
						this.startMatch(match);
					});
				}
				round++;
				this.roundManager.currentRound = round;
				resolve(true);
			})
		}
		else if (this.lobyConfig.config._type === "local") {
			this.localMatchQueue.processQueue(this.startMatchAsync.bind(this));
			console.log(`[MatchManager] Match this.localMatchQueue.processQueue(this.startMatchAsync.bind(this));`);

			return new Promise((resolve) => {resolve(true)});
		}

		return new Promise((resolve) => {resolve(false)});
	}
  


	isSocketStartMatch: boolean = false;
	private startMatch(match: Match): void {
	  console.log(`[MatchManager] Starting match ${match.id}`);
	  // Ajouter les sockets pour les joueurs
	  const isLocal = this.lobyConfig.config._type === "local";
	  this.socketManager.attachSockets(match, isLocal);
/* 		match.playerManager.players.forEach((player) => {
			const socket = this.socketManager.getSocket(player.userId);
			if (socket) {
			  match.socketManager.addSocket(player.userId, socket);
			  this.isSocketStartMatch = true;
			} else {
			  console.log(`Socket not found for player ID ${player.userId}`);
			}
		  });
		  if (!this.isSocketStartMatch) {
			  console.log(`No socket found for players add default socket`);
			  //ajouter 1 socket si local
			  match.playerManager.players.forEach((player) => {
				  const socket = this.socketManager.getLocalSockets();
				  if (socket && !this.isSocketStartMatch) {
					  console.log(`[default socket] Socket found for player ID ${player.userId}`);
					match.socketManager.addSocket(player.userId, socket);
					this.isSocketStartMatch = true;
				  } else {
					console.log(`Socket not found for player ID ${player.userId}`);
				  }
				});
		  }
		  this.isSocketStartMatch = false; */
	  match.start();
	}
	handlePlayerReconnection(userId: number): void {
		const round = this.roundManager.currentRound;
		const match = this.roundManager.getMatchByUserId(userId, round);
		if (match) {
		  this.socketManager.handleReconnection(match, userId);
		} else {
		  console.error(`[MatchManager] No match found for reconnected player ${userId} in round ${round}`);
		}
	}
  
	/* private */ startMatchAsync(match: Match): Promise<void> {
	console.log(`[MatchManager]startMatchAsync Match ${match.id} `);
			
	  return new Promise((resolve) => {
		match.on("end", () => {
		  console.log(`[MatchManager] Match ${match.id} ended`);
		  this.databaseManager.processDataBaseSaveMatchResult(match); // Save match result to database
		  match.observer.isSaved = true;
		  resolve();
		});
		this.startMatch(match);
	  });
	}
  
	getAllMatches(round: number): Match[] {
	  return this.roundManager.getAllMatches(round);
	}
  
	allMatchesAreOver(): boolean {
	  const round = this.roundManager.currentRound;
	  return this.roundManager.allMatchesAreOver(round);
	}
  
	forceStopAllMatches(round: number): void {
	  this.roundManager.forceStopAllMatches(round);
	}

	getMatchByUserId(userId: number,round:number): Match | null {
		return this.roundManager.getMatchByUserId(userId,round);
	}
	getCurrentMatchByUserId(userId: number): Match | null {
		return this.roundManager.getCurrentMatchByUserId(userId);
	}

	getMatch(matchId: string,round:number): Match | undefined {
		return this.roundManager.getMatch(round, matchId);
	}
	getCurrentMatch(matchId: string): Match | undefined {
		const round = this.roundManager.currentRound;
		return this.roundManager.getMatch(round, matchId);
	}

	//un tableau de tout les match par round
	getAllMatchesinAllRound(): {round:number, matches: Partial<Match>[]}[] {
		const allMatches = this.roundManager.getAllMatchesinAllRound()
		return allMatches;
	}

  }