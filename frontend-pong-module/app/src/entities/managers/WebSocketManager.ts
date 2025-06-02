// Create a type alias for a function that take a parameter of any type and returns nothing.
type	WebSocketEventCallback = (data: any) => void;

export class	WebSocketManager {

	private _lobyId: string | null = null;

	private	_socket: WebSocket | null = null;
	private	VITE_BACKEND_SERVER_WS_URL: string = import.meta.env.VITE_BACKEND_SERVER_WS_URL || 'wss://localhost:4433/ws';

	private	eventListeners: Map< string, WebSocketEventCallback[] > = new Map();
	private	wsMe: { userId: number; name: string; index: number } | null = null;
	private	_dataConfig: { id: string; config: { type: string; players: any[] } } | null = null;

	constructor () { }

	get dataConfig ()	{ return this._dataConfig ; }

	set lobyId (lobyId: string | undefined)	{ this._lobyId = lobyId || this._lobyId; console.log('Loby ID:', this._lobyId); }

	handleMessage (message: any) {
		console.log('WebSocket message received:', message);
		const	{ type, ...data } = message;
		this.notifyListeners(type, data);

		switch (type) {
			case 'me':
				this.wsMe = data;
				break ;
			case 'SETUPNEWGAME':
				this._dataConfig = message.data;
				if (!this._dataConfig) { console.error('No dataConfig found'); return; }
				this.wsMe!.index = this._dataConfig.config.players.findIndex((player) => player.userId === Number(this.wsMe?.userId));
				break ;
		}
	}

	sendMessage (message: any) {
		console.log("Message to send:", message);
		try {
			const jsonString = JSON.stringify(message);
			this._socket?.send(jsonString);
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	}

	connect () {
		this._socket = new WebSocket(`${this.VITE_BACKEND_SERVER_WS_URL}/wspong`);
		this._socket.onopen = () => {
			console.log('WebSocket game connection established');
			this._socket!.send(JSON.stringify({ type: 'joinPong', format: 'classic', pongId: this._lobyId }));
		};
		this._socket.onmessage = (event) => {
			console.log('Message from server:', event.data);
			if (event.data) {
				const	message = JSON.parse(event.data);
				this.handleMessage(message);
			}
		};

		this._socket.onclose = () => {
			console.log('WebSocket game connection closed');
			this._socket = null;
		};

		this._socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	};

	// Allows other classes to register to specific events
	on (eventType: string, callback: WebSocketEventCallback) {
		if (!this.eventListeners.has(eventType))	{ this.eventListeners.set(eventType, []); }
		this.eventListeners.get(eventType)!.push(callback);
	}

	// Notify all subscribors of a specific event
	private notifyListeners (eventType: string, data: any) {
		const	listeners = this.eventListeners.get(eventType);
		if (listeners) { listeners.forEach((callback) => callback(data)); }
	}

	// Send message to the server
	sendMoveMessage (direction: string | null = null) {
		const message = { 
			type: 'move',
			lobyId: `${this._lobyId}`,
			pongId: `${this._dataConfig?.id}`,	
			index: this.wsMe!.index,
			direction
		};

		if (this._socket) {
			this._socket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket is not connected');
		}
	}
}
