import { fetchProfileData } from "../services/authService";
import WebSocketService, {WebSocketsService, IWebSocketsService } from "./WebSocketService";
export interface Players {
  id?: number;
  type: string;
  is_IA:boolean,
  avatar?:string,
  display_name?:string,
  score:number
  user: User | number | null;
}

export interface GameHistory {
    id: number;
    score1: number;
    player1: number;
    score2: number;
    player2: number;
    created_at: string;
    updated_at: string;
    players?: Players[];
    winner?: string | null;
}

export interface Game {
    id: number;
    difficulty: number;
  //  mode: string;
    state: string;
    gameHistory: GameHistory | null;
    created_at: string;
    type: string;
    format: string;
    //si local, les players sont un tableau de displaynames
    local_players: string[];
   /*  updated_at: string; */
}

export interface UserStats {
  id: number;

//nombre de parties jouées
  total_game_played: number;
 //nombre de parties gagnées
  total_game_won: number;
 //nombre de parties perdues
  total_game_lost: number;
 //nombre de parties nulles
  total_game_draw: number;

 //nombre de parties jouées en local
  local_game_played: number;
 //nombre de parties gagnées en local
  local_game_won: number;
 //nombre de parties perdues en local
  local_game_lost: number;
 //nombre de parties nulles en local
  local_game_draw: number;

 //nombre de parties jouées en remote
  remote_game_played: number;
 //nombre de parties gagnées en remote
  remote_game_won: number;
 //nombre de parties perdues en remote
  remote_game_lost: number;
 //nombre de parties nulles en remote
  remote_game_draw: number;

 //nombre de parties jouées en tournoi
  tournament_game_played: number;
 //nombre de parties gagnées en tournoi
  tournament_game_won: number;
 //nombre de parties perdues en tournoi
  tournament_game_lost: number;
 //nombre de parties nulles en tournoi
  tournament_game_draw: number;

 //nombre de parties jouées en tournoi local
  tournament_local_game_played: number;
 //nombre de parties gagnées en tournoi local
  tournament_local_game_won: number;
 //nombre de parties perdues en tournoi local
  tournament_local_game_lost: number;
 //nombre de parties nulles en tournoi local
  tournament_local_game_draw: number;
  
 //nombre de parties jouées en tournoi remote
  tournament_remote_game_played: number;
 //nombre de parties gagnées en tournoi remote
  tournament_remote_game_won: number;
 //nombre de parties perdues en tournoi remote
  tournament_remote_game_lost: number;
 //nombre de parties nulles en tournoi remote
  tournament_remote_game_draw: number;
}
export interface User {
    id: number;
    name: string;
    avatar: string;
    role: string;
    games: Game[] | null;
    tournaments: Tournaments[] | null;
    created_at: string;
    updated_at: string;
   userStats?: UserStats;
}
export interface Tournaments {
	id: number;
	games?: Game[];
	state?: string;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	rounds?: Round[];
	currentRound?: number;
	winner: User | number|null;
}
export interface Round {
	id: number;
	games: Game[];
	state: string;
	players?: User[] | number[];
	created_at: Date;
	updated_at: Date;
	tournaments?: Partial<Tournaments>[];
	current: number;
}

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
}

/**
 * Singleton pour gérer l'état global de l'application
 *  un singleton est un patron de conception qui garantit qu'une classe n'a qu'une seule instance
 *  et fournit un point d'accès global à cette instance.
 */
class GlobalState {
    private static instance: GlobalState; // Instance unique de la classe
    private authData: any;
    private profileData: any;
    private islogged: boolean;
    private _user: User | null;
    private _ws: IWebSocketsService | null;

    private _nbMessages: number;
    private _messagesBySender: { [key: string]: any[] };
  
    // Constructeur privé pour empêcher l'instanciation directe
    // de la classe depuis l'extérieur (pas de new GlobalState())
    // c'est une classe singleton
    private constructor() {
      this.authData = null;
      this.profileData = null;
      this.islogged = false;
      this._user = null;
      this._nbMessages = 0;
      this._messagesBySender = {};
       // this._ws = WebSocketsService.getInstance() as unknown as IWebSocketsService;
        this._ws = WebSocketService as unknown as IWebSocketsService;
        this._firstLoadProfileData();
    }

    private _firstLoadProfileData = async () => {
      console.log('Fetching profile data on first load...');
        try {
          const profileData = await fetchProfileData();
          this.setuser(profileData);
          this.setProfileData(profileData);
      }
        catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }
  
    // Méthode statique pour obtenir l'instance unique
    public static getInstance(): GlobalState {
      if (!GlobalState.instance) {
        GlobalState.instance = new GlobalState();
      }
      return GlobalState.instance;
    }
  
    /* GETTERS */
    public get user() {
      return this._user;
    }

    public get ws() {
        return this._ws;
    }
  
    public get isLoggedIn() {
      return this.islogged;
    }

    /**Getters messages */
    public get nbMessages() {
      return this._nbMessages;
    }
    public get messagesBySender() {
      return this._messagesBySender;
    }

    public incrementNbMessages() {
      this._nbMessages++;
      document.dispatchEvent(
        new CustomEvent('nb-messages-updated', {
          detail: { nbMessages: this._nbMessages },
        })
      );
    }
  
    /* SETTERS */
    public setuser(user: any) {
      this._user = user;
      console.log('user', user);
    }
  
    public setLoginSuccess() {
      this.islogged = true;
      document.dispatchEvent(
        new CustomEvent('login-success', {
          bubbles: true,
          composed: true,
          detail: { islogged: true },
        })
      );
    }
  
    public setLogoutSuccess() {
      this.islogged = false;
      this.authData = null;
      this.profileData = null;
      this._user = null;
      document.dispatchEvent(
        new CustomEvent('logout-success', {
          bubbles: true,
          composed: true,
          detail: { islogged: false },
        })
      );
    }
  
    public setAuthData(data: any) {
      this.authData = data;
      document.dispatchEvent(
        new CustomEvent('auth-data-updated', {
          detail: { authData: data },
        })
      );
    }
  
    public getAuthData() {
      return this.authData;
    }
  
    public setProfileData(data: any) {
      this.profileData = data;
      document.dispatchEvent(
        new CustomEvent('profile-data-updated', {
          detail: { profileData: data },
        })
      );
    }
  
    public getProfileData() {
      return this.profileData;
    }

  }

export const UserContext = ()=>{
    const globalState = GlobalState.getInstance();
    const user = ()=>globalState.user;
    const setUser = (user: User | null) => {
        globalState.setuser(user);
    };
    const setLoginSuccess = (authToken:string) => {
        globalState.setLoginSuccess();
        globalState.setProfileData(user());
        const id = user()?.id;
        if (!id) {
            console.error('User ID is undefined');
            return;
        }
        globalState.ws?.sendLoginMessage(id.toString(),authToken); 

    };
    const setUserLogout = () => {
        globalState.ws?.sendLogoutMessage();
        globalState.setLogoutSuccess();
        globalState.setProfileData(null); 
    };
    const ws = ()=>globalState.ws;
    return { user, setUser , setLoginSuccess, setUserLogout, ws};
/*     return {
      user: () => globalState.user,
      setUser: globalState.setuser.bind(globalState),
      setLoginSuccess: globalState.setLoginSuccess.bind(globalState),
      setUserLogout: globalState.setLogoutSuccess.bind(globalState),
      ws: () => globalState.ws,
  }; */

} 
  export default GlobalState.getInstance();