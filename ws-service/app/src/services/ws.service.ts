import { FastifyRequest } from "fastify";
import { get } from "http";
import { RawData, WebSocket } from "ws";
interface WaitingPlayers {
		userId: string,
		id: number | null,
		name: string | null,
		avatar: string | null,
		state: string | null
	
}
interface WebbSocketGame {
	state : string,
	waitingPlayers:WaitingPlayers[]
}
// Gestion des utilisateurs connectés
const clients = new Map<string, WebSocket>();
const games = new Map<number, WebbSocketGame>();

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

	addGame: (id: number, game: any) => {
        games.set(id, game);
    },

	// Supprimer un client
    removeGame: (id: number) => {
        games.delete(id);
        console.log(`❌ Game ${id} delete`);
    },
	getGames: () => {
		return Array.from(games.values());
	},
	notifyIsGames:()=>
	{
		const jsonMessage = JSON.stringify({ type:"games", games:wsService.getGames() });
		wsService.broadcast(jsonMessage);
	},
	getGamebyId: (id: number) => {
		if (games.has(id)) {
			return games.get(id);
		}
	},
	addWaitingPlayersToGame: (gameId: number, waitingPlayers:WaitingPlayers) => {

		if (games.has(gameId)) {
			const game = games.get(gameId)!;
			// Vérifier si le joueur est déjà dans la liste des joueurs en attente
			const playerExists = game.waitingPlayers.some((player) => player.userId === waitingPlayers.userId);
			if (playerExists) {
				console.log(`Player ${waitingPlayers.userId} already in waitingPlayers`);
				// Si le joueur existe déjà, on met a jour ses informations
				const playerIndex = game.waitingPlayers.findIndex((player) => player.userId === waitingPlayers.userId);
				game.waitingPlayers[playerIndex].state = waitingPlayers.state;
				game.waitingPlayers[playerIndex].avatar = waitingPlayers.avatar;
				game.waitingPlayers[playerIndex].name = waitingPlayers.name;
				game.waitingPlayers[playerIndex].id = waitingPlayers.id;
				return;
			}
			game.waitingPlayers.push(waitingPlayers);
			games.set(gameId, game);
		}else {
			console.log(`waitingPlayers  err`,waitingPlayers);
			console.error(`Game ${gameId} not found`);
		}
	}
};
