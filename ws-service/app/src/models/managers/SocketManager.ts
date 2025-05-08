import { WebSocket } from "@fastify/websocket";
import { Match } from "../gameClass/NewMatch";
export class SocketManager {
	private sockets: Map<number, WebSocket> = new Map();
  
	addSocket(playerId: number, socket: WebSocket): void {
	  this.sockets.set(playerId, socket);
	  console.log(`Socket added for player ID ${playerId}`);
	}
  
	getSocket(playerId: number): WebSocket | null {
	  return this.sockets.get(playerId) || null;
	}

	updateSocket(playerId: number, socket: WebSocket): void {
	if (this.sockets.has(playerId)) {
		console.log(`Updating socket for player ID ${playerId}`);
		this.sockets.set(playerId, socket);
	} else {
		console.warn(`Socket for player ID ${playerId} not found, adding new socket`);
		this.addSocket(playerId, socket);
	}
	}
  
	removeSocket(playerId: number): void {
	  if (this.sockets.has(playerId)) {
		this.sockets.delete(playerId);
		console.log(`Socket removed for player ID ${playerId}`);
	  }
	}
  /**
   * 
   * @param data new
   */
	broadcastMessage(data:any): void {
	  const message = JSON.stringify(data);
	  for (const socket of this.sockets.values()) {
		socket.send(message);
	  }
	}
	broadcast(message: string): void {
	  for (const socket of this.sockets.values()) {
		socket.send(message);
	  }
	}
	sendMessageDataToUser(id:number,data: string, type: string): void {
	 const socket = this.sockets.has(id);
	 if (socket) {
	   const userSocket = this.sockets.get(id);
	   if (userSocket) {
		 userSocket.send(JSON.stringify({ type, data }));
	   } else {
		 console.error(`Socket not found for player ID ${id}`);
	   }
	 }
	}

	//retourne le 1er socket existant
	getLocalSockets(): WebSocket|null{
	//console.log(`SocketManager getLocalSockets sockets`,this.sockets);
	  for (const socket of this.sockets.values()) {
		return socket;
	  }
	  return null;
	}




		attachSockets(match: Match, isLocal: boolean): void {
		  if (isLocal) {
			// Un seul socket pour tous les joueurs en local
			const localSocket = this.getLocalSockets();
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
			  const socket = this.getSocket(player.userId);
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
		  const socket = this.getSocket(userId);
		  if (socket) {
			match.socketManager.addSocket(userId, socket);
			console.log(`[MatchSocketManager] Reattached socket for player ${userId} in match ${match.id}`);
		  } else {
			console.error(`[MatchSocketManager] No socket found for reconnected player ${userId} in match ${match.id}`);
		  }
		}
  }