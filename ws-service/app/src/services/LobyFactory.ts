import { WebSocket } from "@fastify/websocket";
import { Loby,lobys } from "./Loby";

/**
 * LobyFactory
 * @description Factory class to create and manage loby instances
 * @class LobyFactory
 * @static lobysLock - Lock to prevent concurrent access to lobys
 * @static initializeCleanup - Initializes the cleanup scheduler for loby instances
 * @static cleanupLoby(sockets: Map<string, WebSocket>) - Cleans up loby instances that are finished or not started
 * @static createLoby() - Creates a new loby instance and adds it to the lobys map
 * @static getLobyById(lobyId: string) - Retrieves a loby instance by its ID
 * @static broadcastCreatedLobyMessage(sockets: Map<string, WebSocket>,forcecleanup: boolean) - Broadcasts a message to all connected sockets with the current loby instances
 */
export class LobyFactory {

	// Mise en place d'un verrou pour éviter les accès concurrents
	static isLocked = false;
	static async lobysLock(callback: () => Promise<void>) {
		while (this.isLocked) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		this.isLocked = true;
		try {
			await callback(); // ← important
		} finally {
			this.isLocked = false; // Déverrouiller après l'exécution
		}
	}

	static cleanupInitialized = false;
	static initializeCleanup(sockets: Map<string, WebSocket>) {
		if (this.cleanupInitialized) return; // déjà lancé
		console.log("✅ Cleanup scheduler initialized");
		this.cleanupInitialized = true;
		// Déclenche le nettoyage toutes les 5 minutes
		setInterval(() => {
			console.log("🔄 Running automated lobby cleanup...");
			this.cleanupLoby(sockets);
		}, 5 * 60 * 1000); // 5 minutes
	}

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

	//remove loby from the map where loby.config.state=="finished"
	static async cleanupLoby(sockets: Map<string, WebSocket>) {
		let lobbiesDeleted = false;

		await this.lobysLock(async () => {
			const currentTime = Date.now();
			for (const [lobyId, loby] of lobys.entries()) {
				const age = currentTime - loby.createDate;
				const shouldDelete =
					(loby.getCurrentPhase() === "LOBBYENDPHASE" && age > 5 * 60 * 1000) ||
					(loby.getCurrentPhase() === "NotStarted" && age > 5 * 60 * 1000);

				if (shouldDelete) {
					lobys.delete(lobyId);
					console.log(`🧹 Deleted loby with ID ${lobyId}`);
					lobbiesDeleted = true;
				}
			}
		}); // Si des lobbies ont été supprimés, informer les utilisateurs
		if (lobbiesDeleted) {
			console.log("🔔 Broadcasting updated lobby list after cleanup...");
			await this.broadcastCreatedLobyMessage(sockets,false);
			lobbiesDeleted = false; // Réinitialiser le flag après la diffusion
		}
	}

	static broadcastCreatedLobyMessage = async (sockets: Map<string, WebSocket>,forcecleanup = true)=> {
		if (forcecleanup) {
		await this.cleanupLoby(sockets);
		}
		await this.lobysLock(async () => {
			const rooms = Array.from(lobys.values());
		
			const array = rooms.map((room) => (room.toJSON() ));

			const messages = { type:"games", games:array };
			console.log(`LobyFactory broadcastCreatedMessage messages`,messages);
		
			for (const socket of sockets.values()) {
				try {
					socket.send(JSON.stringify(messages));
				} catch (err) {
					console.error("❌ Failed to send message to socket", err);
				}
			}
		});
	}
}