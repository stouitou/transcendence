import { RawData, WebSocket } from "ws";
export interface WaitingPlayers {
		userId: number,//@TODO:  user: number,
		id: number | null,
		name: string | null,//@TODO: change to display_name
		avatar: string | null,
		state: string | null,
		// state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled",
		isInGame: boolean,
		isIA: boolean,//@TODO: change to is_IA
		position?: {
			x: number,
			y: number
		},
		size?: {width: number, height: number}
		score?: number,
}
export interface WebSocketGameConfig {
	type : string, // "local" | "remote"
	format : string, // "classic" | "tournament"
	//gameType: string, // "pong" | "pong2" | "pong3"
	tournamentId: number | null,
	maxPlayers: number,
	isallowedRegistration: boolean, // for friendly game
	gameId: number,
	state: string, // "open","waiting" | "playing" | "finished"
	players: WaitingPlayers[],
	ball?: {
		x: number,
		y: number
	}
}
export interface WebbSocketGame {
	state : string,
	//waitingPlayers:WaitingPlayers[],
	config: WebSocketGameConfig
}
// Gestion des utilisateurs connectés
const clients = new Map<string, WebSocket>();
const games = new Map<string, WebbSocketGame>();

export const wsService = {
	clients,

	// Ajouter un client
    addClient: (id: string, socket: WebSocket) => {
        clients.set(id, socket);
        console.log(`✅ Utilisateur ${id} connecté`);
    },
	// Mettre à jour l'ID d'un client
	updateClientId: (oldId: string, newId: string) => {
        if (clients.has(oldId)) {
            const socket = clients.get(oldId)!;
            clients.delete(oldId);
            clients.set(newId, socket);
            console.log(`🔄 Association WebSocket : ${oldId} → ${newId}`);
        }
    },
	// Supprimer un client
    removeClient: (id: string) => {
        clients.delete(id);
        console.log(`❌ Utilisateur ${id} déconnecté`);
    },

	removeSocket: (socket: WebSocket) => {
		clients.forEach((value, key) => {
			if (value === socket) {
				clients.delete(key);
				console.log(`❌ Utilisateur ${key} déconnecté`);
			}
		});
	},

	notifyIsOnline:()=>
	{
		const jsonMessage = JSON.stringify({ type:"isOnline", users:wsService.getClients() });
		wsService.broadcast(jsonMessage);
	},

	// Envoyer un message à tous les clients
    broadcast: (message: string) => {
        clients.forEach((socket) => {
            socket.send(message);
        });
    },
	//envoyer un message à un client
	sendToClient: (id: string, message: string) => {
		if (clients.has(id)) {
			const socket = clients.get(id)!;
			socket.send(message);
		}
	},

    handleMessage: (id: string, data: RawData) => {
        console.log(`📩 Message reçu de ${id} :`, data.toString());
        
        // Exemple : envoyer un message à tous
        wsService.broadcast(`🔔 Message de ${id} : ${data.toString()}`);
    },

	getClients: () => {
		return Array.from(clients.keys());
	},

	addGame: (id: string, game: any) => {
		try {
        games.set(id, game);
		}
		catch (error) {
			console.error("🟥 Error in addGame",error);
			throw error;
		}
    },

	// Supprimer un client
    removeGame: (id: string) => {
        games.delete(id);
        console.log(`❌ Game ${id} delete`);
    },
	getGames: () => {
		return Array.from(games.values());
	},
	notifyIsGames:()=>
	{
		console.log("🔒games notify",wsService.getGames());
		const jsonMessage = JSON.stringify({ type:"games", games:wsService.getGames() });
		wsService.broadcast(jsonMessage);
	},
	getGamebyId: (id: string) => {
		if (games.has(id)) {
			return games.get(id);
		}
	},
	addWaitingPlayersToGame: (gameId: string, waitingPlayers:WaitingPlayers) => {

		if (games.has(gameId)) {
			const game = games.get(gameId)!;
			// Vérifier si le joueur est déjà dans la liste des joueurs en attente
			const playerExists = game.config.players.some((player) => player.id === waitingPlayers.id);
			if (playerExists) {
				console.log(`Player ${waitingPlayers.userId} already in waitingPlayers`);
				// Si le joueur existe déjà, on met a jour ses informations
				const playerIndex = game.config.players.findIndex((player) => player.userId === waitingPlayers.userId);
				game.config.players[playerIndex].state = waitingPlayers.state;
				game.config.players[playerIndex].avatar = waitingPlayers.avatar;
				game.config.players[playerIndex].name = waitingPlayers.name;
				game.config.players[playerIndex].id = waitingPlayers.id;
				return;
			}
			game.config.players.push(waitingPlayers);
			games.set(gameId, game);
		}else {
			console.log(`waitingPlayers  err`,waitingPlayers);
			console.error(`Game ${gameId} not found`);
		}
	}
};
