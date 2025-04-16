import { BaseComponent } from "../frameworks/base-component.ts";
import { Game, User, UserContext } from "../globalstate/GlobalState.ts";
import {IWebSocketsService, WebSocketGameReceivedMessage, WebSocketsService} from "../globalstate/WebSocketService.ts";

export type GameReceivedMessage = {
	gameId: string,
	state: string,
}
export type GameJoinedReceivedMessage = {

	gameId: string,
	waitingPlayers: {id:string,avatar:string|null,name:string,state:string},
}
export class LobyComponent extends BaseComponent<{ ws: IWebSocketsService | null ,
  games: GameReceivedMessage[]|null,
  game: Game|null,
  waitingPlayers: GameJoinedReceivedMessage[]|null,
  user: User|null,
  subscribe: boolean}> {

  private gameID: number|null = null;
  constructor() {
    super({ws:null, games:null, waitingPlayers:null,user:null, subscribe:false,game:null});
   }
    connectedCallback() {
      super.connectedCallback();
      this.state.ws = UserContext().ws();
      this.state.user = UserContext().user();
      this.fetchGamebyId(this.gameID!);
     // this.handleWsGame();
      this.render();
       // Listen for private ws-game
      document.addEventListener('ws-games', async(e: Event) => {
       // this.handleWsGame();
      // this.setWaitingPlayers();
       await this. updatefetchGamebyId(this.gameID!);
       this.setWaitingPlayers();
        this.render();
      });
      // Listen for private ws-game
      document.addEventListener('ws-games-joined',async  (e: Event) => {
        console.log('ws-games-joined event');
        this.setWaitingPlayers();
        await this. updatefetchGamebyId(this.gameID!);
     //   this.render();
      });
    }
    setSubscribe() {
      this.state.subscribe = !this.state.subscribe;
    }
    setWaitingPlayers() {
      this.state.waitingPlayers = this.state.ws?.wsGamesJoined?? null;
    }

    handleWsGame = () => {      
      this.state.games = this.state.ws?.wsGames?? null;
    };
      set data(gameID: number) {
        console.log('game is set', gameID);
          this.gameID = gameID;
        }
      async fetchGamebyId(gameID: number) {
        const result = await fetch(`https://localhost:4433/api/game-management-service/games/${gameID}`)
        if (result.ok) {
          const game:Game = await result.json();
          console.log('LobyComponent game:', game);
          this.state.game = game;
          if (game.type === 'remote') {
          const data = JSON.stringify({ type: "gameCreate",  gameId: this.gameID ,   name: this.state.user?.name, avatar: this.state.user?.avatar });  
                 
          this.state.ws?.sendMessage(data);
          }
         // else {  
            this.render();
         // }
        } else {
          console.error('Error fetching game data:', result.statusText);
        }
      }
      async updatefetchGamebyId(gameID: number) {
        const result = await fetch(`https://localhost:4433/api/game-management-service/games/${gameID}`)
        if (result.ok) {
          const game = await result.json();
          this.state.game = game;
          console.log('LobyComponent game:', game);
        } else {
          console.error('Error fetching game data:', result.statusText);
        }
      }

    render() {
      const game = this.state.game;
      const players = this.state.game?.gameHistory?.players;
      const waitingPlayers = this.state.waitingPlayers;
      console.log('Loby waitingPlayers', waitingPlayers);

        this.innerHTML = `
        <div  class="form-container">
        <h2 class="text-3xl font-bold text-center mb-6 ">Remote Loby
          <span class="text-sm "> server View</span>
        </h2>
        <div class="flex flex-col items-center">Game ID: ${this.gameID}</div>
        <div class="flex flex-col items-center">Game State: ${game?.state}</div>
        <div class="flex flex-col items-center">Game Difficulty: ${game?.difficulty}</div>
        <div class="flex flex-col items-center">Game Type: ${game?.type}</div>
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
                  <td><p>${player.display_name}</p></td>
                  <td><p>${player.is_IA ? 'IA' : ''}</p></td>
                  <td><img src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  <td><p>joined</p></td>
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
            ${ waitingPlayers.map((player,index) => `
              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${player.waitingPlayers.name}</p></td>
                  <td><img src="${player.waitingPlayers.avatar?.startsWith('http') ? player.waitingPlayers.avatar : player.waitingPlayers.avatar ? `https://localhost:4433/${player.waitingPlayers.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  <td><p>joined</p></td>
              </tr>

            `).join('')}`: ''}
          </tbody>
        </table>
  </div>
      `;
    }
 
}

export class LobyComponentClient extends BaseComponent<{ ws: IWebSocketsService | null ,
  games: GameReceivedMessage[]|null,
  game: Game|null,
  waitingPlayers: GameJoinedReceivedMessage[]|null,
  user: User|null,
  subscribe: boolean}> {

  private gameID: number|null = null;
  constructor() {
    super({ws:null, games:null, waitingPlayers:null,user:null, subscribe:false,game:null});
   }
    connectedCallback() {
      super.connectedCallback();
      this.state.ws = UserContext().ws();
      this.state.user = UserContext().user();
      this.updatefetchGamebyId(this.gameID!);
     // this.handleWsGame();
      this.render();
       // Listen for private ws-game
      document.addEventListener('ws-games',async (e: Event) => {
        console.log('ws-games event',(e as CustomEvent).detail);
        const wsGamesDetail = (e as CustomEvent).detail;
        const wsGames = wsGamesDetail.wsGame;
        console.log('ws-games event is: ',wsGames);
        this.state.games = wsGames.filter((game:GameReceivedMessage) => Number(game.gameId) === this.gameID)[0];
        console.log('ws-games event',this.state.games);
        this.state.waitingPlayers = this.state.games.waitingPlayers;
       // this.setWaitingPlayers();
  //      this.handleWsGame();

      await this. updatefetchGamebyId(this.gameID!);
        this.render();
      });
   /*    document.addEventListener('ws-games-remove', async(e: Event) => {
       await this. updatefetchGamebyId(this.gameID!);
        this.setWaitingPlayers();
        this.handleWsGame();
      }); */
      // Listen for private ws-game
/*       document.addEventListener('ws-games-joined',async  (e: Event) => {
        this.setWaitingPlayers();
        await this. updatefetchGamebyId(this.gameID!);
        this.render();
      }); */
    }
    setSubscribe() {
      this.state.subscribe = !this.state.subscribe;
    }
    setWaitingPlayers() {
      this.state.waitingPlayers = this.state.ws?.wsGamesJoined?? null;
    }

/*     handleWsGame = () => {      
      this.state.games = this.state.ws?.wsGames?? null;
      console.log('handleWsGame', this.state.games);
    }; */
      set data(gameID: number) {
        console.log('game is set', gameID);
          this.gameID = gameID;
        }
      

      async updatefetchGamebyId(gameID: number) {
        const result = await fetch(`https://localhost:4433/api/game-management-service/games/${gameID}`)
        if (result.ok) {
          const game = await result.json();
          this.state.game = game;
        } else {
          console.error('Error fetching game data:', result.statusText);
        }
      }

    render() {
      const game = this.state.game;
      const players = this.state.game?.gameHistory?.players;
      const waitingPlayers = this.state.waitingPlayers;
      console.log('waitingPlayers', waitingPlayers);

        this.innerHTML = `
        <div  class="form-container">
        <h2 class="text-3xl font-bold text-center mb-6 ">Remote Loby
          <span class="text-sm "> client View </span>
        </h2>
        <div class="flex flex-col items-center">Game ID: ${this.gameID}</div>
        <div class="flex flex-col items-center">Game State: ${game?.state}</div>
        <div class="flex flex-col items-center">Game Difficulty: ${game?.difficulty}</div>
        <div class="flex flex-col items-center">Game Type: ${game?.type}</div>
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
                  <td><p>${player.display_name}</p></td>
                  <td><p>${player.is_IA ? 'IA' : ''}</p></td>
                  <td><img src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  <td><p>joined</p></td>
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
            ${ waitingPlayers.map((player,index) => `
              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${player.name}</p></td>
                  <td><img src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
                  <td><p>joined</p></td>
                  <td>${!this.state.subscribe?`<button  data-id="${this.gameID}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">JoinGame</button>`:``}</td>
              </tr>

            `).join('')}`: ''}
          </tbody>
        </table>
  </div>
      `;
        this.attachEvent(this, '#join-game', 'click', (event: Event) => {
          const target = event.target as HTMLElement;
          if (!target.matches('button')) return; // le clic provient d'un bouton
          // Vérifiez si le bouton a l'attribut data-type
          const dataID = target.getAttribute('data-id');
          if (dataID) {
            const gameId = Number(dataID);
            this.handleAddPlayer(gameId);
          }
        });
    }
    //PUT  https://localhost:4433/api/game-management-service/games/remote/classic/id/${gameId}
    handleAddPlayer = async (gameId: number) => {
      const result = await fetch(`https://localhost:4433/api/game-management-service/games/remote/classic/id/${gameId}`, {
        method: 'PUT',
       });
      if (result.ok) {
        const game = await result.json();
        console.log('LobyComponent game:', game);
        console.log('LobyComponent user:', this.state.user);
        this.setSubscribe();
       
        //update gameJoined by remove element
    /*     this.state.ws?.setWsGamesJoined(gameId, {
          gameId: gameId,
          waitingPlayers: {id: this.state.user?.id, avatar: this.state.user?.avatar, name: this.state.user?.name, state: 'joined'},
        }); */
        const data = JSON.stringify({ type: "gameJoined",  gameId: gameId , 
          waitingPlayers: {id: this.state.user?.id, name: this.state.user?.name, avatar: this.state.user?.avatar},
           state: "subscribe" });          
        this.state.ws?.sendMessage(data);
        // this.state.ws?.removeWsGamesJoined(this.state.user?.id!);
        
        //fetch add user to game
        //this.render();
        //this.setWaitingPlayers();
        //this.render();
      }
      else {
        console.error('Error fetching game data:', result.statusText);
      }
    }
}

if (!customElements.get('lobby-client-component'))
  customElements.define('lobby-client-component', LobyComponentClient);
export class JoinGameComponent extends BaseComponent<{ ws: IWebSocketsService | null ,games: GameReceivedMessage[]|null,
  user: User|null }> {

  constructor() {
    super({ws:null, games:null,user:null});
   }
    connectedCallback() {
      super.connectedCallback();
      this.state.ws = UserContext().ws();
       this.state.user = UserContext().user();
      this.handleWsGame();
      this.render();
       // Listen for private ws-game
       document.addEventListener('ws-games', (e: Event) => {

        console.log('ws-games event',(e as CustomEvent).detail);
        const wsGamesDetail = (e as CustomEvent).detail;
        const wsGames = wsGamesDetail.wsGame;
        console.log('ws-games event is: ',wsGames);
        this.state.games = wsGames;
        console.log('ws-games event',this.state.games);


      //  this.handleWsGame();
       const div = this.querySelector('#setGame');
       if (!div) return;
       const games =  this.state.games;
       div.innerHTML = `
            ${games? games?.map((game,index) => `

              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${game.gameId}</p></td>
                  <td><p>${game.state}</p></td>
                  <td><button id="join-game-${game.gameId}" data-id="${game.gameId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button></td>
              </tr>
            `).join(''): ''}
        `;
       // this.render();
      });
    }
    handleWsGame = () => {      
      this.state.games = this.state.ws?.wsGames?? null;
      //this.render();
    };

    render() {
      const games =  this.state.games;

        this.innerHTML = `

    <div id="lobbyView"></div>
        <div  class="form-container">
        <h2 class="text-3xl font-bold text-center mb-6 ">Join Game </h2>
        <table>
          <thead>
              <tr>
                  <th class="px-4 py-2">#</th>
                  <th class="px-4 py-2">id</th>
                  <th class="px-4 py-2">state</th>
              </tr>
          </thead>
          <tbody id="setGame">
            ${games? games?.map((game,index) => `

              <tr>
                  <td><p class="text-sm">${index + 1}</p></td>
                  <td><p>${game.gameId}</p></td>
                  <td><p>${game.state}</p></td>
                  <td><button id="join-game-${game.gameId}" data-id="${game.gameId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button></td>
              </tr>
            `).join(''): ''}
          </tbody>
        </table>
  </div>
      `;
      this.attachEvent(this, '#setGame', 'click', (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.matches('button')) return; // le clic provient d'un bouton
        // Vérifiez si le bouton a l'attribut data-type
        const dataID = target.getAttribute('data-id');
        if (dataID) {
          const lobby = this.querySelector('#lobbyView') as HTMLElement;
          if (lobby) {
            //this.ownerDocument
            const lobbyComponent = document.createElement('lobby-client-component') as LobyComponent;
            lobbyComponent.data = Number(dataID);

          const data = JSON.stringify({ type: "gameJoined",  gameId: dataID , 
            waitingPlayers: {id: this.state.user?.id, name: this.state.user?.name, avatar: this.state.user?.avatar},
             state: "joined" });          
          this.state.ws?.sendMessage(data);
            lobby.appendChild(lobbyComponent);
          }
        }
      });
     
    }
}