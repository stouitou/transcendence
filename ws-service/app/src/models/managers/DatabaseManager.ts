import { Match } from "../gameClass/NewMatch";
import { WebSocketGameConfig } from "../../services/ws.service";
type TournamentDATABASE = {
    id: number,	
    currentRound: 0,
    games: [],
    state: string,
    max_players: number,
    created_at: string,
    updated_at: string,
    winner: null|GameHistoryPlayer,
    type: string,
  }
export type PlayerDATABASE = {
		id: number;
		name: string;
		role: string;
		level: number;
		avatar: string;
		created_at: string;
		updated_at: string;
		userStats: any;
	}[]
export type GameHistoryPlayer =
{
	id: number,
	type: string,
	avatar: null,
	display_name: string,
	score: number,
	user: {id: number}|null,
	is_IA: boolean,
	}	
  type GameDATABASE = {
	id: number,
	gameHistory: {
		id: number,
		created_at: string,
		updated_at: string,
		type: string,//"local",
		players: GameHistoryPlayer[]
		},
	max_players: number,
	state: string,
	mode: string,
	players:PlayerDATABASE[],
	currentRound: number,
	created_at: string,
	updated_at: string,
	type: string,
	format: string
  }
export class DatabaseManager {
	private tournamentId: number = -1;
	
	processDataBaseCreateMatch = async(match:Match,currentRound:number=0,tournamentId:number|null=null) => {

		const type = match.config.type;
		//const players = this.playerManager.getPlayers(); ;
		const players = match.playerManager.players;
		const databasePlayers = players.map((player) => ({
			type: type,
			is_IA: player.isIA,
			avatar: player.avatar,
			display_name: player.name,
			score: player.score,
			user:  player.userId ==-1? null : player.userId,
		}));
		//playersId = les userId des joueurs si non null
		const playersId = players.map((player) => player.userId).filter((userId) => userId !== -1);

		const dataDB = {
			state:match.config.state,
			type:match.config.type,
			format:match.config.format,
			max_players:match.config.maxPlayers,
			players: playersId?? [],
	 		gameHistory: {
				players: databasePlayers,
				type: type,
				},
			currentRound,
			tournament: tournamentId,
			};
		try {
			const response = await fetch(`http://game-management-service:3000/docker/games/${match.config.type}/${match.config.format}/normal`, {

			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataDB),
			});
			  if (!response.ok) {
            console.error("processDataBaseCreateTournament error ", response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
			const data = await response.json();
			match.config.gameId=data.id;
			match.config.state = data.state;			
			match.setgameHistoryId(data.gameHistory.id); //utilie pour la mise a jour des resultats
			const ids = data.gameHistory.players.map((player: any) => player.id);
			match.playerManager.players = match.playerManager.players.map((player,index) => {
			//	const dbPlayer = data.gameHistory.players.find((dbPlayer: any) => dbPlayer.user != null && ( dbPlayer.user.id === player.userId));
				player.score = 0;
				player.id = ids[index];				
				return player;
			});
			return data;
		}catch (error) {
			console.error("[DatabaseManager] processDataBaseCreateMatch error", error);
			throw error; // Relancer l'erreur pour la propager
    	}
	}

	processDataBaseSaveMatchResult = async(match:Match) => {
		console.log("[Match]processDataBaseSaveMatchResult gameId ",match.config.gameId);
		console.log("[Match]processDataBaseSaveMatchResult gameHistoryId ",match.gameHistoryId);

		match.config.state="finished";
		const players = match.playerManager.players;
		//determiner le nom du gagnant : player.score le plus eleve
		const winner = players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
		match.observer.winner = winner;
		console.log("[Match]processDataBaseSaveMatchResult winner ",winner);
		const data = {
			players: match.playerManager.players.map((player) => ({
				id: player.id,
				score: player.score
			})),
			game: {
				id: match.config.gameId,
				state: match.config.state},
			winner : winner.name,
		}
		console.log("[Match]processDataBaseSaveMatchResult data ",data);
		
		try {
		//const result = await fetch(`https://localhost:4433/api/game-management-service/gameHistory/${this.gameHistoryId}`, {
		const result = await fetch(`http://game-management-service:3000/docker/gameHistory/${match.gameHistoryId}`, {

			method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				});
			if (result.ok) {
				const data = await result.json();
				console.log("processDataBaseSaveMatchResult data OK ",data);

				//this.isGameFinished = true;
				return data;

			} else {
				console.error("processDataBaseSaveMatchResult  error ",result);
				match.observer.isError = true;
				throw new Error("Error creating game");
			}
		} catch (error) {
			console.error("processDataBaseSaveMatchResult error ",error);
			match.observer.isError = true;
			throw error;
		}
	}

/**
 * Tournoi
 * 
 */
	processDataBaseCreateTournament = async(config: WebSocketGameConfig, lobyId: string) => {
		
		const playersId = config.players.map((player) => player.userId).filter((userId) => userId !== -1);
		const databasePlayers = config.players.map((player) => ({
			type: config.type,
			is_IA: player.isIA,
			avatar: player.avatar,
			display_name: player.name,
			score: player.score,
			user:  player.userId ==-1? null : player.userId,
		}));
/* 		const type = config.type;
		const currentRound = 0;
		const tournamentId = null; */
		const dataDB = {
			state:config.state,
			type:config.type,
			format:config.format,
			max_players:config.maxPlayers,
			players: playersId?? [],
			configPlayers: {
				players: databasePlayers,
				},
			/* currentRound,
			tournament: tournamentId, */
			};
			//const result = await fetch(`http://game-management-service:3000/docker/games/${match.config.type}/${match.config.format}/normal`, {
				//

				console.log("processDataBaseCreateTournament dataDB ",`http://game-management-service:3000/docker/tournaments/${config.type}/${config.format}/normal`);
			

   		 try {
				const response = await fetch(`http://game-management-service:3000/api/game-management-service/docker/tournaments/${config.type}/${config.format}/normal`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({...dataDB}),
				});

				if (!response.ok) {
					console.error("processDataBaseCreateTournament error ", response);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				const { tournament, games } = data as { tournament: TournamentDATABASE; games: GameDATABASE[] };
				this.tournamentId = tournament.id;
				return { tournament, games };
			} catch (error) {
				console.error("[catch] processDataBaseCreateTournament error", error);
				throw error; // Relancer l'erreur pour la propager
			}
				
				
				
				/* .then((response) => {
				if (!response.ok) {
					console.error("processDataBaseCreateTournament error ",response);
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				const { tournament, games } = data as { tournament: TournamentDATABASE, games: GameDATABASE[] };
				this.tournamentId = tournament.id;
				return { tournament, games };
			})
			.catch((error) => {
				console.error("processDataBaseCreateTournament error", error);
				throw error;
			});	 */	
	}

	processDataBaseGenerateNextRoundTournament = async() => {
		const tournamentID = this.tournamentId;
		return fetch(`http://game-management-service:3000/api/game-management-service/docker/tournaments/${tournamentID}/generateNextRound`, {

			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({}),
		}).then((response) => {
			if (!response.ok) {
				console.error("processDataBaseCreateTournament error ",response);
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			const { tournament, games } = data as { tournament: TournamentDATABASE, games: GameDATABASE[] };
			return { tournament, games };
		})
		.catch((error) => {
			console.error("processDataBaseCreateTournament error", error);
			throw error;
		});		
	}
  }
