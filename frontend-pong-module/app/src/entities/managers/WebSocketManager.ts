type WebSocketEventCallback = (data: any) => void;
export class WebSocketManager {
	private eventListeners: Map<string, WebSocketEventCallback[]> = new Map();
	private wsMe: { userId: number; name: string; index: number } | null = null;
	private dataConfig: { id: string; config: { type: string; players: any[] } } | null = null;

	
	private socket: WebSocket | null = null;
	private VITE_BACKEND_SERVER_WS_URL = import.meta.env.VITE_BACKEND_SERVER_WS_URL || 'wss://localhost:4433/ws';
	lobyId: string | null = null;
	constructor() {
	  //this.socket = new WebSocket(`${this.VITE_BACKEND_SERVER_WS_URL}/wspong`);
	  //this.socket.onmessage = this.handleMessage.bind(this);
	 // this.connect();
	}
	setLobyid(lobyId: string | null = null) {
	  this.lobyId = lobyId || this.lobyId;
	  console.log('Loby ID:', this.lobyId);
	  return this;
	}
  
	handleMessage(message: any) {
	//  const message = JSON.parse(event.data);
	  console.log('WebSocket message received:', message);
	  const { type, ...data } = message;
	  this.notifyListeners(type, data);
	  switch (type) {
		case 'me':
			this.wsMe = data;
			break;
		case 'SETUPNEWGAME':
			this.dataConfig = message.data;
			if (!this.dataConfig) {
				console.error('No dataConfig found');
				return;
			  }
			  this.wsMe!.index = this.dataConfig.config.players.findIndex(
				(player) => player.userId === Number(this.wsMe?.userId)
			  );
			break
	  }
	}
  
	sendMessage(message: any) {
		console.log("Message to send:", message);
		try {
		  const jsonString = JSON.stringify(message);
		  this.socket?.send(jsonString);
		} catch (error) {
		  console.error("Failed to send message:", error);
		}
	  }

	connect() {
		this.socket = new WebSocket(`${this.VITE_BACKEND_SERVER_WS_URL}/wspong`);
		this.socket.onopen = () => {
		  console.log('WebSocket game connection established');
		  this.socket!.send(JSON.stringify({ type: 'joinPong', format: 'classic', pongId: this.lobyId }));
		};
		this.socket.onmessage = (event) => {
		  console.log('Message from server:', event.data);
		  if (event.data) {
			const message = JSON.parse(event.data);
			this.handleMessage(message);
		  }
		};
		this.socket.onclose = () => {
		  console.log('WebSocket game connection closed');
		  this.socket = null;
		};
	
		this.socket.onerror = (error) => {
		  console.error('WebSocket error:', error);
		};
	};



	  // Permet à d'autres classes de s'abonner à des événements spécifiques
	  on(eventType: string, callback: WebSocketEventCallback) {
		if (!this.eventListeners.has(eventType)) {
		  this.eventListeners.set(eventType, []);
		}
		this.eventListeners.get(eventType)!.push(callback);
	  }
	
	  // Notifie tous les abonnés d'un événement spécifique
	  private notifyListeners(eventType: string, data: any) {
		const listeners = this.eventListeners.get(eventType);
		if (listeners) {
		  listeners.forEach((callback) => callback(data));
		}
	  }


	    //send message to the server
  sendMoveMessage (direction: string|null = null) {
    const message = { 
      type: 'move',
      // lobyId: `${this.dataConfig?.lobyId}`,
       lobyId: `${this.lobyId}`,
        pongId: `${this.dataConfig?.id}`,        
        index: this.wsMe!.index,
       direction
      };

    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
  }