import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";
import { IWebSocketsService } from "../globalstate/WebSocketService";
import { GameReceivedMessage, LobyComponent, LobyComponentClient } from "./loby-component";

if (!customElements.get('lobby-client-component'))
  customElements.define('lobby-client-component', LobyComponentClient);
export class GameLobyComponent extends BaseComponent<{ ws: IWebSocketsService | null ,games: GameReceivedMessage[]|null,  user: User|null,
isCreateGame:boolean}>  {

  constructor() {
	super({ws:null, games:null,user:null,isCreateGame:false});
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
				   <td><button id="join-game-${game.gameId}" data-id="${game.gameId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				  ${!this.state.ws?.isUserInGamebyId(Number(game.gameId), this.state.user?.id!)?'Join':'view'}</button></td>
				
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
	setCreateGame = () => {
		this.state.isCreateGame = !this.state.isCreateGame;
		this.render();
	}

	render() {
	  const games =  this.state.games;
	  const {isCreateGame} = this.state;

		this.innerHTML = `

		<div id="lobby" data-type="no"></div>
		<button class="btn" id="createGame">${!isCreateGame?`create game`:`view list`}</button>
		${!isCreateGame?`
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
				  ${game.state === 'open' ?
				   `
				  <td><button id="join-game-${game.gameId}" data-id="${game.gameId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				  ${!this.state.ws?.isUserInGamebyId(Number(game.gameId), this.state.user?.id!)?'Join':'view'}</button></td>`
				  : game.state}
			  </tr>
			`).join(''): ''}
		  </tbody>
		</table>

  </div>`:''}

		${isCreateGame?`<game-setting-component></game-setting-component>`:''}
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

			//user already in game?
			const game = this.state.ws?.isUserInGamebyId(Number(dataID), this.state.user?.id!);
			if (!game) {
			const id = this.state.user?.id;
		 //   const waitingPlayers = { userId,id: id, name: message.name, avatar: message.avatar,state:message.state };
		  const data = JSON.stringify({ type: "gameJoined",  gameId: dataID , 
			name: this.state.user?.name,
			avatar: this.state.user?.avatar,
		   // waitingPlayers: {id: this.state.user?.id, name: this.state.user?.name, avatar: this.state.user?.avatar},
			 state: "joined" });
			 console.log('JSON.parse(data)',JSON.parse(data));
		  this.state.ws?.sendMessage(data);
			}
			lobby.appendChild(lobbyComponent);
		  }
		}
	  });
	 

	  //attache creategame event
	  this.attachEvent(this, '#createGame', 'click', (event: Event) => {
		event.preventDefault();
		this.setCreateGame();

		console.log('create game', this.state.isCreateGame?"true":"false");
	  });
	 
	  /* this.attachEvent(this, '#lobby', 'DOMNodeInserted', (event: Event) => {
		event.preventDefault();
		const lobyDiv =this.querySelector('#lobby') as HTMLElement;
		if (lobyDiv) {
		  console.log('lobyDiv',lobyDiv.getAttribute('data-type'));
		  lobyDiv.getAttribute('data-type') === 'no' ? null : this.querySelector('game-setting-component')?.remove();;
		  
		}
  
	  }); */
	  const targetNode = document.querySelector('#lobby');
	  if (!targetNode) return;

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.");
	  const lobyDiv =this.querySelector('#lobby') as HTMLElement;
	  if (lobyDiv) {
	  	lobyDiv.getAttribute('data-type') === 'no' ? null : this.querySelector('game-setting-component')?.remove();
	  }
    } else if (mutation.type === "attributes") {
      console.log(`The ${mutation.attributeName} attribute was modified.`);
	// lobyDiv.getAttribute('data-type') === 'no' ? null : this.querySelector('game-setting-component')?.remove();;
//	mutation.attributeName === 'data-type' ? null : this.querySelector('game-setting-component')?.remove();
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

	}
}