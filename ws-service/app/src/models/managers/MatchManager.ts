import { WaitingPlayers, WebSocketGameConfig } from "../../services/ws.service";
import { Match } from "../gameClass/NewMatch";
import { generateUID } from "../../utils/generateUID";
import { Player } from "../gameClass/Player";
import { DatabaseManager, GameHistoryPlayer, PlayerDATABASE } from "./DatabaseManager";
import { SocketManager } from "./SocketManager";
import { LobyConfig } from "../../services/Loby";

export class MatchManager {
	rounds: Map<number, Map<string, Match>> = new Map();
	private dataBaseManagerInstance: DatabaseManager = new DatabaseManager();
	private socketManagerInstance: SocketManager;
	lobyConfig: LobyConfig;

	constructor(lobyConfig:LobyConfig,  socketManager: SocketManager) {
	  this.lobyConfig = lobyConfig;
	  this.socketManagerInstance = socketManager;
	}
  
	get dataBaseManager() {
	  return this.dataBaseManagerInstance;
	}
/* 	createMatch(config: WebSocketGameConfig, lobyId: string): Match {
	  this.rounds.set(0, new Map<string, Match>()); // Initialize the rounds map
	  const id = generateUID();
	  const match = new Match(lobyId, id, config);
	  this.matches.set(id, match);
	  this.rounds.get(0)?.set(id, match); // Add the match to the rounds map
	//  this.rounds.set(0, match);// set the round to 0
	  console.log(`Match created with ID ${id}`);
	  return match;
	} */
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


	/* createMatchForRound (configs: WebSocketGameConfig[], 
		lobyId: string,round:number = 0): Match[] { */
	createMatchForRound (configs: WebSocketGameConfig[], 
			lobyId: string,round:number = 0): Match[] {
	// Initialize the rounds map if it doesn't exist
	if (!this.rounds.has(round)) {
	  this.rounds.set(round, new Map<string, Match>());
	}

	//2 cas, soit un match soit plusieurs un tournois

	//si un simple match

	if (configs[0].format === "classic") {	
		
		const matches:Match[] =	configs.map((config) => {
			const id = generateUID();
			const match = new Match(lobyId, id, config);
		//	this.matches.set(id, match);
			this.rounds.get(round)?.set(id, match); // Add the match to the rounds map
		//	this.rounds.set(0, id);// set the round to 0
			console.log(`Match created with ID ${id}`);
			return match;
			});

			for (const match of matches) {
				try {
					this.dataBaseManager.processDataBaseCreateMatch(match);
					console.log("Match saved to database:", match);
				} catch (error) {
					console.error("Error saving match to database:", error);
				}
				//this.saveMatchToDatabase(match);	
			}
			return matches;
		} else if (configs[0].format === "tournament") {
			const tournamentCongig = this.createMatchForTournament(configs[0], lobyId);
			return tournamentCongig;
		}

		return []
	}

	createMatchForTournament = (config: WebSocketGameConfig, lobyId: string): Match[] => {

			this.dataBaseManagerInstance.processDataBaseCreateTournament(config,lobyId)
			.then(({ tournament, games }) => {
				const matches:Match[] = [];
				if (tournament && games) {
					for (const game of games) {
						const configGame:WebSocketGameConfig = {
							type: game.type,
							format: game.format,
							//mode: this.config._mode,
							tournamentId: tournament.id,
							maxPlayers: game.max_players,
							isallowedRegistration: true,
							gameId: game.id,
							state: tournament.state,
							players: game.gameHistory.players.map((player: GameHistoryPlayer,index:number) => {
								const jsonPlayer: WaitingPlayers = {
									userId: player.user?.id??-1,//@TODO:  user: number,
									id: player.id,
									name: player.display_name,//@TODO: change to display_name
									avatar: player.avatar,
									state: "joined",
									// state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled",
									isInGame: true,
									isIA: player.is_IA,
									//user: player.userId == -1 ? null : player.userId,
								};
								return new Player(jsonPlayer, index);
							}),
						};
						const id = generateUID();
						const match = new Match(lobyId, id, configGame);
						match.config.tournamentId = tournament.id;
						match.config.state = tournament.state;
					//	match.config.format = tournament.format;
						/* match.config.type = tournament.type;
						match.config.maxPlayers = tournament.max_players; */
						match.config.gameId = game.id;
						match.setgameHistoryId(game.gameHistory.id);
					/* 	match.playerManager.players = game.players.map((player: GameHistoryPlayer) => {
							return new Player(player.user, player.display_name, player.avatar, player.type, player.is_IA);
						}); */
						/* match.playerManager.players.forEach((player: Player) => {
							//player.userId = player.userId == -1 ? null : player.userId;
							player.score = 0;
							player.isInGame = false;
							player.state = "waiting";
							player.isIA = player.isIA;
							player.position = { x: 0, y: 0 };
							player.size = { width: 0, height: 0 };
						}); */
						//this.matches.set(id, match);

						this.rounds.get(0)?.set(id, match); // Add the match to the rounds map
						matches.push(match);
					console.log(`Match created with ID ${id}`);
					}
				/* try {
					this.dataBaseManager.processDataBaseCreateMatch(match);
					console.log("Match saved to database:", match);
				} catch (error) {
					console.error("Error saving match to database:", error);
				} */
				}
				else {
					console.error("Error creating tournament: No tournament or games found");
				}
				return matches;
			})
			.catch((error) => {
			console.error("Error creating tournament:", error);

			return [];
			});
		return [];
		}
  
	getMatch(matchId: string,round:number): Match | undefined {
		// Check if the match exists in the rounds map
		if (this.rounds.has(round)) {
			const matches = this.rounds.get(round);
			if (matches && matches.has(matchId)) {
				return matches.get(matchId);
			}
		}
		return ;
	 // return this.matches.get(matchId);
	}
	getAllMatches(round:number): Match[] {
	// Check if the round exists in the rounds map
		if (this.rounds.has(round)) {
			const matches = this.rounds.get(round);
			if (matches) {
				return Array.from(matches.values());
			}
		}
	// If the round doesn't exist, return an empty array
	  return [];
	//  return Array.from(this.matches.values());
	}

	//gestion sequentielle des matchs locaux
	//gestion de la file d'attente des matchs locaux
	private localMatchQueue: Match[] = [];
	private isProcessingLocalMatches: boolean = false;
	private async processLocalMatches(): Promise<void> {
		console.log("Processing local matches queue this.isProcessingLocalMatches",this.isProcessingLocalMatches);
		if (this.isProcessingLocalMatches) {
		  return; // Évite les appels multiples
		}
	  
		this.isProcessingLocalMatches = true;
	  
		while (this.localMatchQueue.length > 0) {
		  const match = this.localMatchQueue.shift(); // Récupère le premier match de la file d'attente
		  if (!match) {
			console.log("No match found in the queue");
			continue;
		  }
	  
		  console.log(`[processLocalMatches] Starting local match ${match.id}`);
		  await this.startMatchAsync(match); // Attendre que le match se termine
		  console.log(`[processLocalMatches] Local match ${match.id} finished`);
		}
	  
		this.isProcessingLocalMatches = false;
	  }
	  private startMatchAsync(match: Match): Promise<void> {
		return new Promise((resolve) => {
		  // Ajouter un listener pour détecter la fin du match
		  match.on("end", () => {
			console.log(`[MatchManager] Match ${match.id} ended promise resolved`);
			resolve(); // Résoudre la promesse lorsque le match est terminé
		  });
	  
		  // Démarrer le match
		  this.startMatch(match);
		});
	  }


	  isSocketStartMatch: boolean = false;
	  private startMatch(match: Match): void {
		console.log(`[MatchManager]startMatch() -- Starting match ${match.id}`);
		if (match.observer.isStarted) {
		  console.log(`Match ${match.id} is already started`);
		  return;
		}
	  
		// Ajouter les sockets pour les joueurs
		match.playerManager.players.forEach((player) => {
		  const socket = this.socketManagerInstance.getSocket(player.userId);
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
				const socket = this.socketManagerInstance.getLocalSockets();
				if (socket && !this.isSocketStartMatch) {
					console.log(`[default socket] Socket found for player ID ${player.userId}`);
				  match.socketManager.addSocket(player.userId, socket);
				  this.isSocketStartMatch = true;
				} else {
				  console.log(`Socket not found for player ID ${player.userId}`);
				}
			  });
		}
		this.isSocketStartMatch = false;
	  
		// Démarrer le match
		match.start();
		console.log(`Match ${match.id} started`);
	  }



	isSend:boolean = false;
	issetted:boolean = false;

	setupMatch(round:number): void {

		if (this.rounds.has(round)) {
			console.log(`[setupMatch] all matches for round ${round}`);
		  } else {
			  console.log(`[setupMatch] No matches found for round ${round}`);
			  return;
		  }
		//get Matches from the rounds
		const matches = this.rounds.get(round);
		if (!matches) {
		  console.log(`No matches found for round ${round}`);
		  return;
		}

		matches.forEach((match) => {
			if (match.config.type === "local"&& !this.issetted) {
			  // Ajouter les matchs locaux à la file d'attente
			  console.log(`[setupMatch] Match if ${match.id} config: ${match.config.type} added to local queue`);
			  this.localMatchQueue.push(match);
			} else {
			console.log(`[setupMatch] Match else ${match.id} config: ${match.config.type} started`);
			  // Démarrer immédiatement les matchs remote
			  this.startMatch(match);
			}
		  });
		  this.issetted = true;
	}
	
	startAllMatches(round:number): void {
		if (this.rounds.has(round)) {
		  console.log(`Starting all matches for round ${round}`);
		} else {
			console.log(`No matches found for round ${round}`);
			return;
		}
		if (!this.issetted)this.setupMatch(round);
		/* //get Matches from the rounds
		const matches = this.rounds.get(round);
		if (!matches) {
		  console.log(`No matches found for round ${round}`);
		  return;
		}

		matches.forEach((match) => {
			if (match.config.type === "local"&& this.issetted) {
			  // Ajouter les matchs locaux à la file d'attente
			  this.localMatchQueue.push(match);
			} else {
			  // Démarrer immédiatement les matchs remote
			  this.startMatch(match);
			}
		  });
		  this.issetted = true; */
		
		  // Démarrer le traitement des matchs locaux
		  if (!this.isProcessingLocalMatches) {
			this.processLocalMatches();
		  }
		//parcourir tous les matchs et ajouter le socket
		/* 	matches.forEach((match) => {
		
		  if (match.observer.isStarted) {
			console.log(`Match ${match.id} is already started`);
			return;
		  }

		  
		  //parcourir tous les joueurs et ajouter le socket
	  match.playerManager.players.forEach((player) => {
			const socket = this.socketManagerInstance.getSocket(player.userId);
			if (socket) {
			  match.socketManager.addSocket(player.userId,socket);
			} else {
			  console.log(`Socket not found for player ID ${player.userId}`);
			}
		  });
		  match.start();
		  console.log(`Match ${match.id} started`);

		}); */

/* 	  this.matches.forEach((match) => {
		if (match.observer.isStarted) {
		  console.log(`Match ${match.id} is already started`);
		  return;
		}
		//parcourir tous les joueurs et ajouter le socket
		match.playerManager.players.forEach((player) => {
		  const socket = this.socketManagerInstance.getSocket(player.userId);
		  if (socket) {
		//	match.socketManager.addSocketPlayer(socket,player.userId);
			match.socketManager.addSocket(player.userId,socket);
		  } else {
			console.log(`Socket not found for player ID ${player.userId}`);
		  }
		});
//		match.socketManager.broadcastMessage(match.toJSON(),'data');
		match.start();
		console.log(`Match ${match.id} started`);
	  }); */
	}

	/* getPlayersInMatch(matchId: string): Player[] | null {
		const match = this.matches.get(matchId);
		if (match) {
		  return match.playerManager.players;
		}
		return null;
	} */
	getMatchByUserId(userId: number,round:number): Match | null {
	// Check if the match exists in the rounds map
		if (this.rounds.has(round)) {
			const matches = this.rounds.get(round);
			if (matches) {
				for (const match of matches.values()) {
					const player = match.playerManager.isPlayer(userId);
					if (player) {
						return match;
					}
				}
			}
		}
		return null;
	}
	forceStopAll(round:number): void {
		if (this.rounds.has(round)) {
			const matches = this.rounds.get(round);
			if (matches) {
				matches.forEach((match) => {
					match.stop();
				});
			}
		}
		else {
			console.log(`No matches found for round ${round}`);
		}
	}

	allMatchesAreOver(round:number): boolean {
		if (this.rounds.has(round)) {
			const matches = this.rounds.get(round);
			if (matches) {
				for (const match of matches.values()) {
					if (!match.observer.isFinished) {
						return false;
					}
				}
				return true;
			}
		}
		return false;
	}
  }