import { fetchProfileData } from "../services/api.auth";
import { User } from "../types/types";
import WebSocketService, { IWebSocketsService } from "./WebSocketService";

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
      // console.log('Fetching profile data on first load...');
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
    //  console.log('user', user);
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