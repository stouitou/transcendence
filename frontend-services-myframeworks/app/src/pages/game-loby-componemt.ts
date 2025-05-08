import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";
import { IWebSocketsService, Match } from "../globalstate/WebSocketService";
import { GameReceivedMessage, LobyComponentClient } from "./loby-component";

if (!customElements.get('lobby-client-component'))
  customElements.define('lobby-client-component', LobyComponentClient);
export class GameLobyComponent extends BaseComponent<{ ws: IWebSocketsService | null ,games: Match[]|null,  user: User|null,
isCreateGame:boolean}>  {

  constructor() {
	super({ws:null, games:null,user:null,isCreateGame:false});
   }
   /**
	* listen for custom events
	*/
   handleListenerSuccessCreateGame(e: Event) {
    const customEvent = e as CustomEvent;
	console.log('redirectToLoby',customEvent.detail);
    //receive message from ws { type:"SUCCESCREATEGAME", lobyId:loby.lobyId as string }
	const lobby = document.querySelector('#lobby') as HTMLElement;
	lobby.setAttribute('data-type', "yes");
	this.state.isCreateGame = false;
	this.render();
	const lobyID = customEvent.detail.lobyId//target.getAttribute('data-loby-id');
	if (lobyID) {
		const lobby = this.querySelector('#lobbyView') as HTMLElement;
		if (lobby) {
			const lobbyComponent = document.createElement('lobby-client-component') as LobyComponentClient;
			lobbyComponent.LobyId = lobyID;
			lobby.appendChild(lobbyComponent);
			}
		}
	}

	handleListenerProfileUpdate = (e: Event) => {
		console.log('profile-data-updated event received');
        const customEvent = e as CustomEvent;
        this.state.user = customEvent.detail.profileData;
        this.updateList();
	}
	handleListenerWsGameUpdate = (e: Event) => {
		console.log('ws-games event',(e as CustomEvent).detail);
		const wsGamesDetail = (e as CustomEvent).detail;
		const wsGames = wsGamesDetail.wsGame;
		console.log('ws-games event is: ',wsGames);
		this.state.games = wsGames;
		console.log('ws-games event',this.state.games);
		this.updateList();
	}


	connectedCallback() {
	  this.state.ws = UserContext().ws();
	  this.state.user = UserContext().user();
	  this.handleWsGame();
	  this.render();

	  this.listenCustomEvent('SUCCESCREATEGAME', this.handleListenerSuccessCreateGame.bind(this));
	  this.listenCustomEvent('profile-data-updated', this.handleListenerProfileUpdate.bind(this));
	  this.listenCustomEvent('ws-games', this.handleListenerWsGameUpdate.bind(this));
	}

 	handleWsGame = () => {
		console.log('handleWsGame',this.state.ws?.wsGames);
		if(!this.state.ws) return;
		
	  this.state.games = this.state.ws.wsGames;
		console.log('handleWsGame games',this.state.games);
	};
	setCreateGame = () => {
		this.state.isCreateGame = !this.state.isCreateGame;
		this.render();
	}

	updateList=()=> {
		const div = this.querySelector('#setGame');
		if (!div) return;
		const games =  this.state.games;
		div.innerHTML = `
			${games? games?.map((game,index) => `
			  <tr>
				  <td><p class="text-sm">${index + 1}</p></td>
				  <td><p>${game.lobyId}</p></td>
				  <td><p>${game.config.state}</p></td>
				  <td><p>${game.config.type}</p></td>
				  <td><p>${game.config.format}</p></td>
				   <td><p>${game.config.players.length}/${game.config.maxPlayers}</p></td>
				  ${game.config.state === 'open' ?
				   `
				 <td><button id="join-game-${game.lobyId}" data-loby-id="${game.lobyId}" data-id="${game.config.gameId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				 ${!this.state.ws?.isUserInLobybyId(game.lobyId, this.state.user?.id!)?'Join':'view'}</button></td>
				
				  `
				  : game.config.state}
			  </tr>
			`).join(''): ''}
		`;
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
				  <th class="px-4 py-2">type</th>
				  <th class="px-4 py-2">format</th>
				  <th class="px-4 py-2">players</th>
				  <th class="px-4 py-2">action</th>
			  </tr>
		  </thead>
		  <tbody id="setGame">
			
		  </tbody>
		</table>

  </div>`:''}

		${isCreateGame?`<game-setting-component></game-setting-component>`:''}
	  `;
	  this.updateList();// mise a jour de la liste des Loby disponible
	  this.attachEvent(this, '#setGame', 'click', (event: Event) => {
		event.preventDefault();
		const target = event.target as HTMLElement;
		if (!target.matches('button')) return; // le clic provient d'un bouton
		// Vérifiez si le bouton a l'attribut data-type
		//const dataID = target.getAttribute('data-id');
		const lobyID = target.getAttribute('data-loby-id');
		if (lobyID) {
		  const lobby = this.querySelector('#lobbyView') as HTMLElement;
		  if (lobby) {
			lobby.innerHTML = '';
			const lobbyComponent = document.createElement('lobby-client-component') as LobyComponentClient;
			//lobbyComponent.data = Number(dataID);
			lobbyComponent.LobyId = lobyID;

			//user already in game?
			//const game = this.state.ws?.isUserInGamebyId(Number(dataID), this.state.user?.id!);
			//@TODO a revoir
			const game = this.state.ws?.isUserInLobybyId(lobyID, this.state.user?.id!)//isUserInGamebyId(Number(lobyID), this.state.user?.id!);
			console.log("user in game",game);
			console.log("user in game lobyID, this.state.user?.id",lobyID, this.state.user?.id);
			//alert(`You clicked on button with data-id: ${dataID} game ${game}`);
			if (!game) {
			const id = this.state.user?.id;
		 //   const waitingPlayers = { userId,id: id, name: message.name, avatar: message.avatar,state:message.state };
		  const data = JSON.stringify({ type: "lobyJoined",
			gameId: -1,// Number(dataID),
			lobyId: lobyID,
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
  
	  }); *//* 
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
 */
	}
}