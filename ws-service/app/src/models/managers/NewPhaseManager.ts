import { LobyConfig } from "../../services/Loby";
import { MatchManager } from "./NewMatchManager";
import { PlayerManager } from "./PlayerManager";
import { SocketManager } from "./SocketManager";
import { Match } from "../gameClass/NewMatch";
import { GameHistoryPlayer } from "./DatabaseManager";

export class LobbyEndPhase implements LobbyPhaseStep {
	name = "LOBBYENDPHASE";
  
	constructor(private lobyConfig:LobyConfig,private context:PhaseContext, private socketManager: SocketManager) {}
  
	async execute(): Promise<LobbyPhaseTransition> {
		this.lobyConfig.config._state = "finished";
		this.socketManager.broadcastMessage({ type: "LOBBYENDPHASE", data: this.context.tournamentWinner });
	  return { next: "done" };
	}
  }
/* export class CountdownPhase implements LobbyPhaseStep {
	name = "CountdownToStart";
  
	constructor(private socketManager: SocketManager, private duration: number = 5) {}
  
	async execute(): Promise<LobbyPhaseTransition> {
	  for (let i = this.duration; i > 0; i--) {
		this.socketManager.broadcastMessage({ type: "COUNTDOWN", value: i });
		await new Promise(resolve => setTimeout(resolve, 1000));		
	  }
	  return { next: "skip" };
	}
  } */
  
  export class MatchPhase implements LobbyPhaseStep {
	name = "MatchRunning";
  
	currentMatchRound: number = 0;
	constructor(private matchManager: MatchManager, private socketManager: SocketManager) {}
  
/* 	async execute(): Promise<LobbyPhaseTransition> {
	 // this.matchManager.launchMatches();
	await  this.matchManager.startAllMatches(this.currentMatchRound);//@TODO a definir le roundNumber
	  this.socketManager.broadcastMessage({ type: "MATCHES_STARTED" });  
	  // Force end after 60 seconds
	 // await new Promise(resolve => setTimeout(resolve, 60000));
	//  this.matchManager.forceStopAll(this.currentMatchRound);
	  return { next: "skip" };
	} */
	  async execute(): Promise<LobbyPhaseTransition> {
		console.log(`[MatchPhase] Starting matches for phase: ${this.name}`);
	
		const round = this.matchManager.roundManager.currentRound;

		this.socketManager.broadcastMessage({ type: "PREPARE_MATCHES_STARTED_ROUND",data:this.matchManager.getAllMatchesinAllRound() });
		// Vérifier si le state du loby est "finished"
		if (this.matchManager.lobyConfig.config._state === "finished") {
		  console.log(`[MatchPhase] Lobby is finished, skipping match phase.`);
		  return { next: "skip" }; // Passer à la phase suivante
		}
	
		if (this.matchManager.lobyConfig.config._type === "local") {
		  console.log(`[MatchPhase] Processing local matches with countdown`);
	
		  // Traiter les matchs locaux avec un compte à rebours avant chaque match
		  await this.matchManager.localMatchQueue.processQueue(
			this.matchManager.startMatchAsync.bind(this.matchManager),
			async (match: Match) => {
			  await this.countdownBeforeMatch(match);
			}
		  );
		} else {
		  console.log(`[MatchPhase] Starting remote matches`);
		  await this.matchManager.startAllMatchesRemote(round,
			async (match: Match) => {
			  await this.countdownBeforeMatch(match);
			});
		}
	
		console.log(`[MatchPhase] Matches completed for phase: ${this.name}`);
	//	return { next: "WaitingOthersToFinish" }; // Passer à la phase suivante
	return { next: "skip" };

	  }

	  private async countdownBeforeMatch(match: Match): Promise<void> {
		this.socketManager.broadcastMessage({ type: "PREPARE_MATCHES_STARTED_ROUND_GAME", data: match.viewDetails() });
//		if (match.config.state === "remote") {

		const countdownDuration = 10; // Durée du compte à rebours en secondes
		for (let i = countdownDuration; i > 0; i--) {
		  this.socketManager.broadcastMessage({ type: "COUNTDOWN", matchId: match.id, value: i });
		  console.log(`[MatchPhase] Countdown for match ${match.id}: ${i}`);
		  await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre 1 seconde
		}
	  }

  }
  
  export class WaitOthersPhase implements LobbyPhaseStep {
	name = "WaitingOthersToFinish";
  
	constructor(private matchManager: MatchManager, private socketManager: SocketManager) {}
  
	async execute(): Promise<LobbyPhaseTransition> {


	  return new Promise<LobbyPhaseTransition>((resolve) => {
		const interval = setInterval(() => {
		  if (this.matchManager.allMatchesAreOver()) {//@TODO a definir le roundNumber
			this.socketManager.broadcastMessage({ type: "ALL_MATCHES_OVER" });
			clearInterval(interval);
			return resolve({ next: "skip" });
			//resolve();
		  } else {
			this.socketManager.broadcastMessage({ type: "WAITING_OTHERS" });
			clearInterval(interval);
			return resolve({ next: "repeat" });
			//return resolve({ next: "goto", phaseIndex: 1 });// recommencer au phaseIndex 1 : CountdownPhase
		  }
		}, 3000);
	  });
	}
  }
  








  export interface LobbyPhaseStep {
	name: string;
	execute(): Promise<LobbyPhaseTransition>;
  }
  export class PhaseContext {
	currentRound: number = 0;
	matchResults: Map<number, any> = new Map(); // Par exemple, résultats des matchs par round
	tournamentWinner: GameHistoryPlayer | null = null; // Gagnant du tournoi
  }
  export type LobbyPhaseTransition =
	| { next: "repeat" }              // répète la même phase
	| { next: "skip" }                // saute à la suivante
	| { next: "goto", phaseIndex: number } // aller à une phase spécifique
	| { next: "end" }                // LOBY terminé
	| { next: "done" }                // terminer la boucle
	| { next: "error", error: any };  // en cas d’erreur
  
	export class TournamentRedirectPhase implements LobbyPhaseStep {
		name = "CheckTournamentRedirect";
	  
		constructor(
		  private config: LobyConfig,
		  private socketManager: SocketManager
		) {}
	  
		async execute(): Promise<LobbyPhaseTransition> {
		  //un tournois se decompose en plusieur phases
		  // le setup initial du tournois
		  //	- recuperation de la liste des joueurs
		  //	- creation en base de donnee du tournois
		  //	- creation de la liste des matchs initial
		  // les match en parallele ou en serie
		  //    - setup des diferent match
		  //    - lancement des match
		  //    - attente de la fin des match
		  //    - recuperation des resultats
		  // la mise a jour des scores
		  //    - mise a jour des resultats
		  // le passage au tour suivant
console.log("TournamentRedirectPhase");
			//console.log("TournamentRedirectPhase",this.config);
			this.socketManager.broadcastMessage({ type: "DEBUG" ,debug:{...this.config}});

		  if (this.config.config._format === "tournament" /* && this.config.nextRoundAvailable() */) {
			this.socketManager.broadcastMessage({ type: "NEXT_ROUND_STARTING" });
			//return  new Promise<LobbyPhaseTransition>((resolve) => resolve({ next: "goto", phaseIndex: 1 })); // Recommencer au match
			return  new Promise<LobbyPhaseTransition>((resolve) => resolve({ next: "skip" })); // Recommencer au match
		  }
	  
		  this.socketManager.broadcastMessage({ type: "LOBBY_ENDED" ,debug:this.config});
		  // prevoir un clean de tout les match et du loby
		 // return  new Promise<LobbyPhaseTransition>((resolve) => resolve({ next: "done" }))
		  return  new Promise<LobbyPhaseTransition>((resolve) => resolve({ next: "end" }))
		}
	  }

	  export class CreateMatchRedirectPhase implements LobbyPhaseStep {
		name = "MatchCreate";
  
			constructor(
				private matchManager: MatchManager,
				private playerManager:PlayerManager,
				private socketManager: SocketManager,
				private lobyConfig:LobyConfig) {}
		
			async execute(): Promise<LobbyPhaseTransition> {

		const configs = this.matchManager.createConfigMatch(this.playerManager.getPlayers(),this.lobyConfig);
		//const configs = this.createConfigMatch();
	//	const matches = this.matchManager.createMatchForRound(configs, this.lobyConfig.lobyId);
		//const matches = this.matchManager.createMatchesForRound(configs, this.lobyConfig.lobyId);
		try {
			const matches = await this.matchManager.createMatches(configs, this.lobyConfig.lobyId);
		
			return { next: "skip" };
		} catch (error) {
			console.error("[CreateMatchRedirectPhase]......   Error creating matches:", error);
			return { next: "error", error };
		}
			//this.matchManager.createMatchForRound();
		
		//	await new Promise(resolve => setTimeout(resolve, 2000));
			// Force end after 60 seconds
	//		await new Promise(resolve => setTimeout(resolve, 60000));
	//		this.matchManager.forceStopAll(0);//@TODO a definir le roundNumber
	}

	  }

	  export class CreateTournamentNexyRoundPhase implements LobbyPhaseStep {
		name = "CreateTournamentNexyRoundPhase";
  
			constructor(
				private context:PhaseContext,
				private matchManager: MatchManager,
				private lobyConfig:LobyConfig) {}
		
			async execute(): Promise<LobbyPhaseTransition> {

				try {
					const result = await this.matchManager.createTournamentNextRound(this.lobyConfig.lobyId);
					await new Promise(resolve => setTimeout(resolve, 2000));
					if (result) {
						this.context.tournamentWinner = result;
						console.log("[PhaseManager] TournamentNextRoundPhase winner:",result);
						//return  { next: "done"} // finir le tournois
						return  { next: "skip"} // finir le tournois via le LobyEndPhase

					}
					return { next: "goto", phaseIndex: 1 }; // Recommencer au match
				} catch (error) {
					console.error("Error creating tournament next round:", error);
					return new Promise(resolve => resolve({ next: "error", error }));
					return { next: "error", error };
				}

		/* const matches =  */await this.matchManager.createTournamentNextRound(this.lobyConfig.lobyId);		
			await new Promise(resolve => setTimeout(resolve, 2000));

			return { next: "goto", phaseIndex: 1 }; // Recommencer au match
	}

	  }
	  
/*
 export interface LobbyPhaseStep {
	name: string;
	execute(): Promise<void>;
  }

export class PhaseManager {
	private phases: LobbyPhaseStep[] = [];
	private currentIndex = 0;
  
	constructor(
	  private matchManager: MatchManager,
	  private playerManager: PlayerManager,
	  private socketManager: SocketManager
	) {
	  this.buildPhases();
	}
  
	private buildPhases() {
	  this.phases.push(new CountdownPhase(this.socketManager));
	  this.phases.push(new MatchPhase(this.matchManager, this.socketManager));
	  this.phases.push(new WaitOthersPhase(this.matchManager, this.socketManager));
	  // Tu peux facilement ajouter d’autres phases ici.
	}
  
	async startPhaseLoop() {
	  while (this.currentIndex < this.phases.length) {
		const phase = this.phases[this.currentIndex];
		console.log(`[PhaseManager] Starting phase: ${phase.name}`);
		await phase.execute();
		this.currentIndex++;
	  }
  
	  console.log(`[PhaseManager] All phases complete`);
	}
  }
   */

  export class PhaseManager {
	private phases: LobbyPhaseStep[] = [];
	private currentIndex = 0;
	private context: PhaseContext = new PhaseContext();
	//roundNumber: number = 0;
	//round: number = 0;
  
	constructor(
		private config:LobyConfig,
		private matchManager: MatchManager,
		private playerManager: PlayerManager,
		private socketManager: SocketManager,
		private onPhaseChange?: (phaseName: string) => void // Callback pour notifier le Loby
		) {
	  this.buildPhases();
	}
  
	private buildPhases() {
	  this.phases.push(new CreateMatchRedirectPhase(this.matchManager, this.playerManager, this.socketManager, this.config));
	//  this.phases.push(new CountdownPhase(this.socketManager));
	  this.phases.push(new MatchPhase(this.matchManager, this.socketManager));
	  this.phases.push(new WaitOthersPhase(this.matchManager, this.socketManager));
	  this.phases.push(new TournamentRedirectPhase(this.config, this.socketManager));
	  this.phases.push(new CreateTournamentNexyRoundPhase(this.context,this.matchManager, this.config));
	  this.phases.push(new LobbyEndPhase(this.config,this.context,this.socketManager));
	}
  
	async startPhaseLoop() {
	  while (this.currentIndex < this.phases.length) {
		const current = this.phases[this.currentIndex];
		console.log(`[PhaseManager] Starting phase: ${current.name}`);
      // Notifier le Loby de la phase actuelle via le callback
		if (this.onPhaseChange) {
			this.onPhaseChange(current.name);
		}
		try {
		  const transition = await current.execute();
  
		  switch (transition.next) {
			case "repeat":
			  console.log(`[PhaseManager] Repeating phase: ${current.name}`);
			  break;
			case "skip":
			  this.currentIndex++;
			  break;
			case "goto":
			  this.currentIndex = transition.phaseIndex;
			  break;
			case "end":
				this.currentIndex = this.phases.length -1; // Fin de la boucle
			  console.log(`[PhaseManager]end Process complete`,this.currentIndex);
			  break;
			case "done":
				console.log(`[PhaseManager] done Process complete`);
				return;
			case "error":
			  console.error(`[PhaseManager] Error in phase: ${current.name}`, transition.error);
			  this.socketManager.broadcastMessage({ type: "PHASE_ERROR", error: transition.error });
			  return; // ou on peut continuer ou redémarrer
		  }
  
		} catch (fatal) {
		  console.error(`[PhaseManager] Fatal error in ${current.name}:`, fatal);
		  return;
		}
	  }
  
	  console.log(`[PhaseManager] All phases executed`);
	}
  }
  