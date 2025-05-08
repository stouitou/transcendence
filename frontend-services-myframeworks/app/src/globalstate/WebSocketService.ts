import GlobalState from "./GlobalState";
interface WaitingPlayers {
  userId: number,
  id: number | null,
  name: string | null,
  avatar: string | null,
  state: string | null,
  // state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled",
  isInGame: boolean,
  isIA: boolean,

}
export interface WebSocketGame {
  //gameId : string,
  lobyId : string,
	state : string,
	//waitingPlayers:WaitingPlayers[],
  config: {
    type: string, // "local" | "remote"
    format: string, // "classic" | "tournament",
    //gameType: string, // "pong" | "pong2" | "pong3"
    tournamentId: string | null,
    maxPlayers: number,
    isallowedRegistration: boolean, // for friendly game
    gameId: string,
    state: string, // "waiting" | "playing" | "finished"
    players: WaitingPlayers[],
    waitingList: WaitingPlayers[],

/*     gameStarted: boolean,
    gameFinished: boolean,
    gameOver: boolean,
    gamePaused: boolean,
    gameResumed: boolean,
    gameEnded: boolean,
    gameCancelled: boolean,
    gameAbandoned: boolean,
    gameDeleted: boolean,
    gameCreated: boolean,
    gameUpdated: boolean,
    gameStartedAt: string,
    gameFinishedAt: string, */
  }
}
interface WebSocketGames {
	type : "games",
	games:Match[]
}
export interface IWebSocketsService {
    setUserId: (userId: string) => void;
    setIsOnline: (users: string[]) => void;
    setPrivateMessages: (callback: (prevMessages: WebSocketPrivateReceivedMessage[]) => WebSocketPrivateReceivedMessage[]) => void;
    setWsGames: (callback: (prevMessages: WebSocketGameReceivedMessage[]) => WebSocketGameReceivedMessage[]) => void;
    wsGames: Match[];

   isUserInGamebyId(gameID:number, UserID:number): boolean;
   isUserInLobybyId(lobyId:string, UserID:number): boolean;

    setWsGamesJoined: (usersGamesJoined: WebSocketGameJoinedReceivedMessage[]) => void;
    removeWsGamesJoined: (id: number) => void;
    wsGamesJoined: WebSocketGameJoinedReceivedMessage[];
    privateMessages: WebSocketPrivateReceivedMessage[];
    sendMessage: (message: string) => void;
    sendLoginMessage: (id: string) => void;
    sendLogoutMessage: () => void;
    userId: string | null;
    isOnline: string[];
    hasWSConnected: boolean;
}

export type WebSocketPrivateReceivedMessage = {

	type: "private",
	from: string,
	message: string,
}
export type Match = {
  id: string,
  lobyId: string,
  players: {id: number;
  name: string;
  avatar: string;
  state: string;
  isInGame: boolean;
  isIA: boolean;
  position: {
      x: number;
      y: number;
  };
  size: {
      width: number;
      height: number;
  };
  score: number;
  paddle: {
      position: {x: number, y: number};
      size: {width: number, height: number};
  };
}[],
  ball: {position: {x: number, y: number}},
  config: {
    type: string;
    format: string;
    tournamentId: string | null;
    maxPlayers: number;
    isallowedRegistration: boolean;
    gameId: string;
    state: string;
    players: WaitingPlayers[];
    waitingList: WaitingPlayers[];
}
}
export type WebSocketGameReceivedMessage = {

	type: "game",
  games:Match[]
}

export type WebSocketGameJoinedReceivedMessage = {

	type: "gameJoined",
	gameId: string,
	waitingPlayers: {id:string,avatar:string|null,name:string,state:string},
}
/**
 * Singleton pour gérer l'état global de l'application
 *  un singleton est un patron de conception qui garantit qu'une classe n'a qu'une seule instance
 *  et fournit un point d'accès global à cette instance.
 */
export class WebSocketsService {
    private static instance: WebSocketsService; // Instance unique de la classe
    private _ws: WebSocket | null;
    private _hasWSConnected: boolean;
    private _userId: string | null;
    private _isOnline: string[];
    private _privateMessages: WebSocketPrivateReceivedMessage[];
    private _wsGames: Match[];
    private _wsGamesJoined: WebSocketGameJoinedReceivedMessage[];
    //this._broadcastChannel = new BroadcastChannel('websocket-channel'); // Crée un canal de communication
  
    // Constructeur privé pour empêcher l'instanciation directe
    // de la classe depuis l'extérieur (pas de new GlobalState())
    // c'est une classe singleton
    private constructor() {
      this._ws =null;
      this._hasWSConnected = false;
      this._userId = null;
      this._isOnline = [];
      this._privateMessages = [];
      this._wsGames = [];
      this._wsGamesJoined = [];
      this._firstLoadWs();
    }

    private _firstLoadWs = () => {

// const BACKEND_SERVER_PORT = import.meta.env.VITE_BACKEND_SERVER_URL || "https://localhost:4433";
 
 const VITE_BACKEND_SERVER_WS_URL = import.meta.env.VITE_BACKEND_SERVER_WS_URL || 'wss://localhost:4433/ws';
      console.log(`WebSocketService _firstLoadWs ${VITE_BACKEND_SERVER_WS_URL}`);
         this._ws = new WebSocket(VITE_BACKEND_SERVER_WS_URL);
         if (!this._ws) {
            console.error('WebSocket is not available');
            return;
          }
          this._ws.onopen = () => {
            console.log('WebSocket connection established');
            this._hasWSConnected = true;
          };
          this._ws.onmessage = (event) => {
            console.log('Received message:', event.data);
            this._handleMessage(event);
			//traitement des messages
			//conversion du message en objet event.data is an Object
         /* try {
            const data = JSON.parse(event.data);
            
             // reception du message de bienvenue et enregistrement de l'id
            if (data.type === "welcome") {
              this.setUserId(data.userId);
            }
            // reception de la liste des utilisateurs en ligne
            else if (data.type === "isOnline") {
              console.log('Received message isOnline:', data.users);
              this.setIsOnline(data.users);
            }
            // reception d'un message privé
            else if (data.type === "private") {
              this.setPrivateMessages(data);
            } 
          }
            catch (error) {
                console.error('Error fetching profile data:', error);
            }*/
          };
          this._ws.onclose = () => {
            console.log('WebSocket connection closed');
            this._ws = null;
          };
    }


    private _handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocketService Received message:', data);
        switch (data.type) {
          case 'welcome':
            this.setUserId(data.userId);
            break;
          case 'isOnline':
            this.setIsOnline(data.users);
            break;
          case 'private':
            this.setPrivateMessages(data);
            break;
          /* case 'game':
            this.setWsGames(data);
            break; */
          case 'gameJoined':
            this.setWsGamesJoined(data);
            break;
          case 'test':
              console.log('test', data);
              this.setest(data);
               break;
          case 'games':
            console.log('games', data);
            //{ type:"games", games:state : string,	waitingPlayers:WaitingPlayers[] }
            this.setWsGames((data as WebSocketGames).games);
            break;
          /* case 'gameAction':
              console.log('test', data);
              this.setest(data);
              break; */
          case 'SUCCESCREATEGAME':
            document.dispatchEvent(
              new CustomEvent('SUCCESCREATEGAME', {
                bubbles: true,
                composed: true,
                detail: { ...data },
              })
            );
            break
          default:
            console.warn('Unknown message type:', data.type);
        }
      }
      catch (error) {
        console.error('Error fetching profile data:', error);
      }
    }
  
    // Méthode statique pour obtenir l'instance unique
    public static getInstance(): WebSocketsService {
      if (!WebSocketsService.instance) {
        WebSocketsService.instance = new WebSocketsService();
      }
      return WebSocketsService.instance;
    }
     /*  public static getInstance(): WebSocketsService {
        // Vérification globale pour conserver l'instance unique
        if (!globalThis.__webSocketServiceInstance) {
          globalThis.__webSocketServiceInstance = new WebSocketsService();
        }
        console.warn('globalThis.__webSocketServiceInstance', globalThis.__webSocketServiceInstance);
        return globalThis.__webSocketServiceInstance;
      } */
  
    /* GETTERS */
    public get userId() {
      return this._userId
    }

    public get isOnline() {
      return this._isOnline;
    }

    public get hasWSConnected() {
      return this._hasWSConnected;
    }

    public get privateMessages() {
      return this._privateMessages;
    }
    public get wsGames() {
      return this._wsGames;
    }
    public get wsGamesJoined() {
      return this._wsGamesJoined;
    }
  
    /* SETTERS */
    public setUserId(userId: string) {
      this._userId = userId;
    }
  
    public setIsOnline(users: string[]) {
      this._isOnline = users;
      document.dispatchEvent(
        new CustomEvent('ws-isOnline', {
          bubbles: true,
          composed: true,
          detail: { users },
        })
      );
    }

    public setPrivateMessages(privateMessage: WebSocketPrivateReceivedMessage) {
      this._privateMessages = [...this._privateMessages, privateMessage];
      document.dispatchEvent(
        new CustomEvent('ws-privateMessage', {
          bubbles: true,
          composed: true,
          detail: { privateMessage },
        })
      );
       GlobalState.incrementNbMessages()
    }
/* 
    public setWsGames(wsGame: WebSocketGameReceivedMessage) {
      this._wsGames = [...this._wsGames, wsGame];
      document.dispatchEvent(
        new CustomEvent('ws-games', {
          bubbles: true,
          composed: true,
          detail: { wsGame },
        })
      );
    } */
    public setWsGames(wsGame: Match[]) {
      this._wsGames = [...wsGame];
      document.dispatchEvent(
        new CustomEvent('ws-games', {
          bubbles: true,
          composed: true,
          detail: { wsGame },
        })
      );
    }
    public setest(wsGame: WebSocketGameReceivedMessage) {
      document.dispatchEvent(
        new CustomEvent('test', {
          bubbles: true,
          composed: true,
          detail: { wsGame },
        })
      );
    }

    public setWsGamesJoined(wsGameJoined: WebSocketGameJoinedReceivedMessage) {
      this._wsGamesJoined = [... this._wsGamesJoined,wsGameJoined];
      document.dispatchEvent(
        new CustomEvent('ws-games-joined', {
          bubbles: true,
          composed: true,
          detail: { wsGameJoined },
        })
      );
    }
    public removeWsGamesJoined(id: number) {
      console.log('removeWsGamesJoined id', id);

      const wsGameJoined = this._wsGamesJoined.filter((game) => Number(game.waitingPlayers.id) !== id).map((game) => game);
      console.log('removeWsGamesJoined', wsGameJoined);
      this._wsGamesJoined = wsGameJoined;
      document.dispatchEvent(
        new CustomEvent('ws-games-joined', {
          bubbles: true,
          composed: true,
          detail: { wsGameJoined },
        })
      );
    }


    sendMessage = (message: string) => {
      console.log('sendMessage', message);
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(message);
      } else {
          console.error('WebSocket is not open');
      }
  };

// Envoi du message lors du login
  sendLoginMessage =  (id:string) => {
      console.log('[WEBSOCKET]  sendLoginMessage', { type: "login", userId:this.userId , id});
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
          const data = JSON.stringify({ type: "login", userId:this.userId , id});
          this._ws.send(data);
      }
      else {
          console.warn("⚠️ WebSocket pas encore prêt. Ajout du message en attente...");
          setTimeout(() => this.sendLoginMessage(id), 100); // Réessaye après 100ms
      }
  };
// Envoi du message lors du logout
    sendLogoutMessage =  () => {
      console.log('[WEBSOCKET] sendLogoutMessage', { type: "logout", userId:this.userId });
      if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
          console.warn("⚠️ WebSocket pas encore prêt. Ajout du message en attente...");
          setTimeout(this.sendLogoutMessage, 100); // Réessaye après 100ms
          return;
      }
      const data = JSON.stringify({ type: "logout", userId:this.userId });
      this._ws.send(data);
  };

  //
  public isUserInGamebyId(gameID:number, UserID:number): boolean {
  //  const game = this._wsGames.find((game) => Number(game.config.gameId) === gameID);
    const game = this._wsGames.find((game) => Number(game.config.gameId) === gameID);
    if (game) {
      const waitingPlayer = game.config.players.find((player) => player.id === UserID);
      console.log("isUserInGamebyId gameID, UserID", gameID, UserID);
      console.log("isUserInGamebyId waitingPlayer", waitingPlayer);
      return waitingPlayer? true : false;
    }
    return false;
  };
  public isUserInLobybyId(lobyId:string, UserID:number): boolean {
    console.log("isUserInLobybyId lobyId, UserID", lobyId, UserID);
    console.log("isUserInLobybyId this._wsGames", this._wsGames);
      const game = this._wsGames.find((game) => (game.lobyId) === lobyId);
      console.log("isUserInLobybyId game", game);
      if (game) {
        const isplayer = game.config.players.find((player) => player.userId === UserID);
        console.log("isUserInGamebyId lobyId, UserID", lobyId, UserID);
        console.log("isUserInGamebyId isplayer", isplayer);
        return isplayer? true : false;
      }
      return false;
    }
}
export default WebSocketsService.getInstance();