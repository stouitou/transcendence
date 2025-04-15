import { FastifyRequest } from "fastify";
import { get } from "http";
import { RawData, WebSocket } from "ws";

// Gestion des utilisateurs connectés
const clients = new Map<string, WebSocket>();
const games = new Map<string, any>();

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
        games.set(id, game);
    },
	// Mettre à jour l'ID d'un client
	updateGameId: (oldId: string, newId: string) => {
        if (games.has(oldId)) {
            const game = games.get(oldId)!;
            games.delete(oldId);
            games.set(newId, game);
        }
    },
	// Supprimer un client
    removeGame: (id: string) => {
        games.delete(id);
        console.log(`❌ Game ${id} delete`);
    },
	getGames: () => {
		return games;
	},
	getGamebyId: (id: string) => {
		if (games.has(id)) {
			return games.get(id);
		}
	}
};
