import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";
import {IWebSocketsService, Match} from "../globalstate/WebSocketService";
interface WaitingPlayers {
  userId: string,
  id: number | null,
  name: string | null,
  avatar: string | null,
  state: string | null,
  isInGame: boolean,
  isIA: boolean,

}
export interface WebSocketGameConfig {
	type : string,
	format : string,
	tournamentId: string | null,
	maxPlayers: number,
	isallowedRegistration: boolean, // for friendly game
	gameId: string,
	state: string, // "open","waiting" | "playing" | "finished"
	players: WaitingPlayers[],
}
export type GameReceivedMessage = {
  lobyId: string,
	state: string,
  config: WebSocketGameConfig,

}
export type GameJoinedReceivedMessage = {

	gameId: string,
	waitingPlayers: {id:string,avatar:string|null,name:string,state:string},
}

export class LobyComponentClient extends BaseComponent<{ ws: IWebSocketsService | null ,
  games: Match[]|null,
  game: Match|null,
  user: User|null,
  subscribe: boolean}> {

  private gameID: number|null = null;
  private lobyID: string|null = null;

  private wsGamesListener: (e: Event) => void;
  constructor() {
    super({ws:null, games:null,/*  waitingPlayers:null, */user:null, subscribe:false,game:null});
    this.wsGamesListener = this.handleWsGames.bind(this);
   }
   private handleWsGames(e: Event) {
    console.log('ws-games event', (e as CustomEvent).detail);
    const wsGamesDetail = (e as CustomEvent).detail;
    const wsGames = wsGamesDetail.wsGame;
    console.log('ws-games event is: ', wsGames);
    console.log('ws-games event this.gameID: ', this.gameID);

    if (this.gameID !== null) {
      this.state.game = wsGames.filter((game: Match) => Number(game.config.gameId) === this.gameID)[0];
    }
    if (this.lobyID !== null) {
      this.state.game = wsGames.filter((game: Match) => game.lobyId === this.lobyID)[0];
    }
    console.log('ws-games event', this.state.game);
    this.render();
  }
  // Suppression de l'écouteur d'événements
  //@TODO a faire dans tout les composant avec un listener
   disconnectedCallback() {
    super.disconnectedCallback();
    // Suppression de l'écouteur d'événements
    document.removeEventListener('ws-games', this.wsGamesListener);
  }
    connectedCallback() {
      super.connectedCallback();
      this.state.ws = UserContext().ws();
      this.state.user = UserContext().user();

      if(this.lobyID !== null ) {
       this.state.game = (this.state.ws?.wsGames as unknown as Match[]).filter((game:any) => (game.lobyId) === this.lobyID)[0];
      }

      this.render();
       // Listen for private ws-game
       document.addEventListener('ws-games', this.wsGamesListener);
    }
    setSubscribe() {
      this.state.subscribe = !this.state.subscribe;
    }
      set data(gameID: number) {
        console.log('game is set', gameID);
          this.gameID = gameID;
        }
      
      set LobyId(lobyID: string) {
        console.log('game is set lobyID', lobyID);
        this.lobyID = lobyID;
      }
      

    render() {
      const game = this.state.game;
      const players = this.state.game?.config.players;
      const waitingPlayers = this.state.game?.config.waitingList;

        this.innerHTML = `
        <div  class="form-container">
        <h2 class="text-3xl font-bold text-center mb-6 ">Remote Loby
          <span class="text-sm "> client View </span>
        </h2>
        <div class="flex flex-col items-center">lobyId ID: ${game?.lobyId}</div>
        <div class="flex flex-col items-center">Game ID: ${game?.config.gameId}</div>

        <div class="flex flex-col items-center"><a class:"btn" href ="/game?id=${game?.lobyId}">join game</a></div>
        <div class="flex flex-col items-center">Game State: ${game?.config.state}</div>
        <div class="flex flex-col items-center">Game config.type: ${game?.config.type}</div>
        <div class="flex flex-col items-center">Game config.format: ${game?.config.format}</div>
        <div class="flex flex-col items-center">Game config.maxPlayers: ${game?.config.maxPlayers}</div>
        <div class="flex flex-col items-center">Game config.tournamentId: ${game?.config.tournamentId}</div>
        <div class="flex flex-col items-center">Game config.isallowedRegistration: ${game?.config.isallowedRegistration}</div>
        <table>
          <thead>
              <tr>
                  <th class="px-4 py-2">#</th>
                  <th class="px-4 py-2">Nom</th>
                  <th class="px-4 py-2">IA</th>
                  <th class="px-4 py-2">Avatar</th>
                  <th class="px-4 py-2">state</th>
              </tr>
          </thead>
          <tbody>
            ${players? players?.map((player,index) => `

              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${player.name}</p></td>
                  <td><p>${player.isIA ? 'IA' : ''}</p></td>
                  <td><img referrerPolicy="no-referrer" src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  <td><p>${player.state}</p></td>
              </tr>
            `).join(''): ''}
          </tbody>
        </table>
${waitingPlayers?`
  <h2 class="text-3xl font-bold text-center mb-6 ">Waiting Players</h2>
        <table>
          <thead>
              <tr>
                  <th class="px-4 py-2">#</th>
                  <th class="px-4 py-2">Nom</th>
                  <th class="px-4 py-2">Avatar</th>
                  <th class="px-4 py-2">state</th>
              </tr>
          </thead>
          <tbody id="join-game">
            ${ waitingPlayers.map((player,index) => 
              player.state !== 'subscribe' ? `
              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${player.name}</p></td>
                  <td><img referrerPolicy="no-referrer" src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  
                  <td><p>${player.state??"joined-default not set"}</p></td>
                  <td>${!this.state.subscribe && player.userId === this.state.user?.id?`<button  data-loby-id="${game?.lobyId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">JoinGame</button>`:``}</td>
              </tr>

            `:"").join('')}`: ''}
          </tbody>
        </table>
  </div>
      `;
      this.attachEvent(this, '#join-game', 'click',async (event: Event) => {
      
      try {
          const target = event.target as HTMLElement;
          if (!target.matches('button')) return; // le clic provient d'un bouton
          // Vérifiez si le bouton a l'attribut data-type
          const dataID = target.getAttribute('data-loby-id');
          const response = await fetch(`/api/auth/ws-csrf`)
          if (!response.ok) {
            console.error('Failed to fetch CSRF token for WebSocket');
            return;
          }
          const wsCSRFToken = await response.json();
          if (dataID) {
              const lobyId = (dataID);
              this.setSubscribe();
              const data = JSON.stringify({
                type: "gameJoined",
                lobyId: lobyId,
                state: "subscribe",
                wsCSRFToken:wsCSRFToken.token
                });          
              this.state.ws?.sendMessage(data);
            }
      } catch (error) {
        console.error('Error fetching CSRF token for WebSocket:', error);
      }
    });
  }    
}

if (!customElements.get('lobby-client-component'))
  customElements.define('lobby-client-component', LobyComponentClient);