import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { User } from '../types/types';
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

    joinGameBtn(game:Match) {
      const minTournamentPlayers = 3;
      const minClassicPlayers = 2;
      const minPlayers = game.config.format === 'tournament' ? minTournamentPlayers : minClassicPlayers;

      if (/* game.config.type === 'local'  && */ game.config.players.length >= minPlayers) {
        return `<a class="btn px-8 py-3"
           href="/game?id=${game?.lobyId}">Join game</a>`;
      }
      return `<div class="btn px-8 py-3"> waiting for players</div>`;
    }
      

    render() {
      const game = this.state.game;
      const players = this.state.game?.config.players;
      const waitingPlayers = this.state.game?.config.waitingList;
      if (!game) {
        this.innerHTML = ''
        return;
      }

        this.innerHTML = /*html*/`
    <div class="form-container max-w-5xl mx-auto px-4 space-y-8">

      <h2 class="text-3xl font-bold text-center">
        Remote Lobby <span class="text-base font-normal">(client view)</span>
      </h2>

      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-lg">
        <div class="font-semibold">Lobby&nbsp;ID:</div>                 <div>${game?.lobyId}</div>
        <!--<div class="font-semibold">Game&nbsp;ID:</div>                  <div>${game?.config.gameId}</div>-->
        <div class="font-semibold">Game&nbsp;State:</div>               <div>${game?.config.state}</div>
        <div class="font-semibold">Type:</div>                          <div>${game?.config.type}</div>
        <div class="font-semibold">Format:</div>                        <div>${game?.config.format}</div>
        <div class="font-semibold">Max&nbsp;players:</div>              <div>${game?.config.maxPlayers}</div>
      <!--  <div class="font-semibold">Tournament&nbsp;ID:</div>            <div>${game?.config.tournamentId}</div>-->
        <div class="font-semibold">Allow&nbsp;registration:</div>       <div>${game?.config.isallowedRegistration}</div>
      </div>
        
      <div class="text-center">
      ${this.joinGameBtn(game)}     
      </div>

      <!-- PLAYERS ------------------------------------------------------------ -->
      <h3 class="text-2xl font-semibold mt-10 mb-4">Players</h3>
      <div class="overflow-x-auto">
        <table class="player-table w-full">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>AI</th><th>Avatar</th><th>State</th>
            </tr>
          </thead>
          <tbody>
            ${
            players ? players.map((p,i)=>`
                <tr>
                  <td><span class="idx-chip">${i+1}</span></td>
                  <td><span class="name-cell">${p.name}</span></td>
                  <td><span class="ia-pill ${p.isIA ? 'on':'human'}">
                      ${p.isIA ? 'IA' : 'Human'}
                    </span></td>
                  <td>
                    <img class="avatar"
                         src="${p.avatar?.startsWith('http')
                ? p.avatar
                : p.avatar
                    ? `${p.avatar}`
                    : ''}"
                         alt="avatar">
                  </td>
                  <td><span class="ia-pill on">${p.state}</span></td>
                </tr>
              `).join('') : ''
        }
          </tbody>
        </table>
      </div>

      <!-- WAITING LIST ------------------------------------------------------- -->
      ${
            waitingPlayers ? `
          <h3 class="text-2xl font-semibold mt-10 mb-4">Waiting players</h3>
          <div class="overflow-x-auto">
            <table class="player-table w-full">
              <thead>
                <tr><th>#</th><th>Name</th><th>Avatar</th><th>State</th><th></th></tr>
              </thead>
              <tbody id="join-game">
                ${
                waitingPlayers.map((p,i)=> p.state!=='subscribe' ? `
                    <tr>
                      <td><span class="idx-chip">${i+1}</span></td>
                      <td><span class="name-cell">${p.name}</span></td>
                      <td><img class="avatar"
                               src="${p.avatar?.startsWith('http')
                    ? p.avatar
                    : p.avatar
                        ? `${p.avatar}`
                        : ''}"
                               alt="avatar"></td>
                      <td><span class="ia-pill on">${p.state??'joined'}</span></td>
                      <td>
                        ${
                    !this.state.subscribe && p.userId===this.state.user?.id
                        ? `<button data-loby-id="${game?.lobyId}"
                                       class="action-btn">
                                 Join game
                               </button>`
                        : ''
                }
                      </td>
                    </tr>
                  ` : '').join('')
            }
              </tbody>
            </table>
          </div>
        ` : ''
        }
    </div>

    <!-- STYLES -------------------------------------------------------------- -->

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