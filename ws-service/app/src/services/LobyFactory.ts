import {  generateUID } from "../utils/generateUID";
import { WebSocket } from "@fastify/websocket";
import { Loby,lobys } from "./Loby";
//import { Loby,lobys } from "./Room";

/**
 * LobyFactory
 * @description Factory class to create and manage loby instances
 * @class LobyFactory
 * @static createLoby() - Creates a new loby instance and adds it to the lobys map
 * @static getLobyById(lobyId: string) - Retrieves a loby instance by its ID
 * @static broadcastCreatedLobyMessage(sockets: Map<string, WebSocket>) - Broadcasts a message to all connected sockets with the current loby instances
 */
export class LobyFactory {
    static createLoby(): Loby {
        const loby = new Loby();
       /*  const lobyId = generateUID();
        loby.setLobyId(lobyId); */
		const lobyId = loby.lobyId;
        lobys.set(lobyId, loby);
        return loby;
    }
	static getLobyById(lobyId: string) {
		const loby = lobys.get(lobyId);
		if (!loby) {
		  console.error(`LobyFactory Loby with ID ${lobyId} not found`);
		  return undefined;
		}
		return loby;
	  }
	  static broadcastCreatedLobyMessage = (sockets: Map<string, WebSocket>)=> {
		const rooms = Array.from(lobys.values());
	  
		const array = rooms.map((room) => (room.toJSON() ));
		const messages = { type:"games", games:array };
		console.log(`LobyFactory broadcastCreatedMessage messages`,messages);
	  
		for (const socket of sockets.values()) {
			socket.send(JSON.stringify(messages));
		}
	  }
}