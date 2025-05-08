import { WebSocket } from "@fastify/websocket"

export class GameSocketManager {
	private sockets: Map<number, WebSocket> = new Map();
  
	addSocket(playerId: number, socket: WebSocket): void {
	  this.sockets.set(playerId, socket);
	}
  
	broadcastState(state: any): void {
	  for (const socket of this.sockets.values()) {
		socket.send(JSON.stringify({ type: "state", game: state }));
	  }
	}
	broadcastMessage( message: any,type:string ="MESSAGE") {
		for (const socket of this.sockets.values()) {
		  if (!socket) continue;
		  socket.send(JSON.stringify({ type: type, data: message }));
		}
	  }
  }