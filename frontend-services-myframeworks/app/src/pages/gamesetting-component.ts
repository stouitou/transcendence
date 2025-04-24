import { BaseComponent } from "../frameworks/base-component.ts";
import { Players, User, UserContext } from "../globalstate/GlobalState.ts";
import { IWebSocketsService } from "../globalstate/WebSocketService.ts";
import { fetchProfileData } from "../services/authService.ts";
import { JoinGameComponent, LobyComponent, LobyComponentClient } from "./loby-component.ts";


if (!customElements.get('lobby-component'))
customElements.define('lobby-component', LobyComponent);

if (!customElements.get('join-game-component'))
  customElements.define('join-game-component', JoinGameComponent);
export class GameSetting extends BaseComponent<{ user: User | null; difficulty: number,type:string,format:string,mode:string,
  max_players: number, players?: Players[] ,ws?: IWebSocketsService | null}> {
  constructor() {
    super({ user: null, difficulty: 1,type:'local',format:'classic',mode:'normal', players:[{
    type: 'local',
    is_IA:false,
    avatar: "https://localhost:4433/uploads/1-avatartest.jpg",
    display_name: 'Player 1',
    score: 0,
    user: null
    }],
    max_players: 4,ws:null });
  }
  handlePost = async (e: Event) => {
    e.preventDefault();
    const data = {
      players: [this.state.user!.id],
      gameHistory: {
      players: this.state.players,
      type: this.state.type,
      user: this.state.type === 'remote' ? this.state.user!.id : null,
    }
  };

    const result = await fetch(`https://localhost:4433/api/game-management-service/games/${this.state.type}/${this.state.format}/${this.state.mode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (result.ok) {
      const data = await result.json();
      //update user
        const updateUser = await fetchProfileData();
        UserContext().setUser(updateUser);

        if (this.state.type === 'remote') {
          const message = JSON.stringify({ type: "gameCreate",  gameId: data.id ,   name: this.state.user?.name, avatar: this.state.user?.avatar });  
                 
          this.state.ws?.sendMessage(message);
          }
        //create lobby
        const lobby = document.querySelector('#lobby') as HTMLElement;
        if (lobby) {
/*           const lobbyComponent = document.createElement('lobby-component') as LobyComponentClient;
          lobbyComponent.data = data.id; */
          const lobbyComponent = document.createElement('lobby-client-component') as LobyComponent;
          lobbyComponent.data = Number( data.id);
          lobby.setAttribute('data-type', "yes");
          lobby.appendChild(lobbyComponent);
        }
       
    } else {
      console.error('Error creating game:', result.statusText);
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.state.user = UserContext().user();
    this.state.ws = UserContext().ws();
    this.state.players![0].avatar = this.state.user?.avatar;
    this.state.players![0].display_name = this.state.user?.name;
    this.render();
    document.addEventListener('profile-data-updated', (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('profile-data-updated event received');
      this.state.user = customEvent.detail.profileData;
      this.state.players![0].avatar = this.state.user?.avatar;
      this.state.players![0].display_name = this.state.user?.name;
      this.state.players![0].user = this.state.user;
      this.render();
    });
  }

  setDifficulty(difficulty: number) {
    this.setState({ ...this.state, difficulty });
    this.render();
  }

  setRemoteMaxPlayers(max_players: number) {
    this.setState({ ...this.state, max_players});
    this.render();
  }

  setUser(user: User) {
    this.setState({ ...this.state, user });
  }

  setType(type: string) {
    this.setState({ ...this.state, type });
    //if type remote remove all players
      const setplayer = this.state.players![0];
    if (type === 'remote') {
      setplayer.type = 'remote';
      setplayer.is_IA = false;
      setplayer.user = this.state.user!.id;
      this.setState({ ...this.state, players: [setplayer] });
    }
    if (type === 'local') {
      setplayer.type = 'local';
      setplayer.is_IA = false;
      setplayer.user = null;
      this.setState({ ...this.state, players: [setplayer] });
    }
    this.render();
  }
  setFormat(format: string) {
    this.setState({ ...this.state, format });
    this.render();
  }
  setMode(mode: string) {
    this.setState({ ...this.state, mode });
    this.render();
  }

  handleDifficultyChange(event: Event) {
    event.preventDefault();
    console.log('handleDifficultyChange');
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.setDifficulty(value);
    console.log('Difficulty changed:', value);
    const progress = this.querySelector('#progress') as HTMLElement;
    if (progress) {
    //  progress.style.width = `${(value - 1) * 20}%`;
  //   const percentage = (value - 1) / (difficultyInput.max - 1) * 100;
     const percentage = (value ) / (5 ) * 100;
     progress.style.width = percentage + '%';
    }
  }

  handleMaxPlayerChange(event: Event) {
    event.preventDefault();
    console.log('handleDifficultyChange');
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.setRemoteMaxPlayers(value);
    console.log('Difficulty changed:', value);
    const progress = this.querySelector('#progressMaxPlayer') as HTMLElement;
    if (progress) {
    //  progress.style.width = `${(value - 1) * 20}%`;
  //   const percentage = (value - 1) / (difficultyInput.max - 1) * 100;
     const percentage = (value ) / (this.state.format==="tournament"?20:4)  * 100;
     progress.style.width = percentage + '%';
    }
  }

  render() {
    const { user, difficulty,type, format,mode,players } = this.state;
    const percentage = (difficulty ) / (5) * 100; // Calculer la largeur initiale
    if (this.state.format === "classic" && this.state.max_players > 4) {
      this.state.max_players = 4;
    }
    const percentageMaxPlayer = (this.state.max_players ) / (format === "tournament"? 20 : 4) * 100; // Calculer la largeur initiale

    this.innerHTML = `
    <div class="flex flex-row items-center justify-center">
    

    <div class="flex flex-col items-center">
      <label for="difficulty" class="text-lg font-medium mb-4">Difficulté du jeu</label>
      <div class="relative w-64 h-8 bg-gray-300 rounded-full overflow-hidden">
        <div id="progress" class="h-full bg-blue-500 transition-all duration-300" style="width: ${percentage}%;"></div>
        <input type="range" id="difficulty" name="difficulty" min="1" max="5" value="${difficulty}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
      </div>
      <div class="mt-4 text-center">
        <span class="text-sm ">Difficulté actuelle : ${difficulty}</span>
      </div>
      <div id="setType" class="mt-4 flex flex-row items-center">
        <button  class="btn mt-4 ${type === 'local'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="local">Local</button>
        <button class="btn mt-4 ${type != 'local'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="remote">Remote</button>
      </div>

      <div id="setFormat" class="mt-4 flex flex-row items-center">
        <button class="btn mt-4 ${format === 'classic'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="classic">classic</button>
        <button class="btn mt-4 ${format != 'classic'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="tournament">tournament</button>
      </div>
      <div id="setMode" class="mt-4 flex flex-row items-center">
        <button class="btn mt-4 ${mode === 'normal'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="normal">Normal</button>
        <button class="btn mt-4 ${mode === 'advanced'? 'bg-blue-600 dark:bg-blue-600':'bg-red-600 dark:bg-red-600'}" data-type="advanced">Advanced</button>
      </div>

      <div class="mt-4">
        <p>Type de jeu: ${type}</p>
        <p>Format de jeu: ${format}</p>
        <p>Mode de jeu: ${mode}</p>
        <p>Joueurs:</p>
        <table>
        <thead>
            <tr>
                <th class="px-4 py-2">#</th>
                <th class="px-4 py-2">Nom</th>
                <th class="px-4 py-2">IA</th>
                <th class="px-4 py-2">Avatar</th>
            </tr>
        </thead>
        <tbody>
          ${players? players?.map((player,index) => `

            <tr>
                <td><p class="text-sm">${index + 1}</p></td>
                <td><p>${player.display_name}</p></td>
                <td><p>${player.is_IA ? 'IA' : ''}</p></td>
                <td><img src="${player.avatar?.startsWith('http') ? player.avatar : player.avatar ? `https://localhost:4433/${player.avatar}` : undefined}" alt="avatar" width="50" height="50"/></td>
            </tr>
          `).join(''): ''}
        </tbody>
        </table>
      </div>
      ${ type ==='remote' ? `
            <label for="maxPlayer" class="text-lg font-medium mb-4">maxPlayer</label>
            <div class="relative w-64 h-8 bg-gray-300 rounded-full overflow-hidden">
              <div id="progressMaxPlayer" class="h-full bg-blue-500 transition-all duration-300" style="width: ${percentageMaxPlayer}%;"></div>
              <input type="range" id="maxPlayer" name="maxPlayer" min="1" max="${format==="tournament"?'20':'4'}" value="${this.state.max_players}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            </div>
      <div class="mt-4 text-center">
        <span class="text-sm ">max_players actuelle : ${this.state.max_players}</span>
      </div>` : ''}

    ${ type ==='local' ? `
          <button id="addIA" class="btn mt-4">Ajouter une ia</button>
    <div>
        
      <form id="addPlayerForm">
        <label for="playerType" class="block mb-2">Type de joueur:</label>

        <label for="playerName" class="block mb-2">Nom du joueur:</label>
        <input type="text" id="playerName" name="playerName" class="form-text-input" required>
        <label for="playerAvatar" class="block mb-2">Avatar du joueur:</label>
        <div class="flex flex-row items-center mb-4">
        <div id ="avatarPreviewSelected">
          <img src="https://localhost:4433/uploads/1-avatartest.jpg" alt="avatar" width="50" height="50"/>
        </div>
       <select id="playerAvatar" name="playerAvatar" class="form-text-input">
          <option value="https://localhost:4433/uploads/1-avatartest.jpg" data-image="https://localhost:4433/uploads/1-avatartest.jpg">Avatar 1</option>
          <option value="https://localhost:4433/uploads/avatar2.jpg" data-image="https://localhost:4433/uploads/avatar2.jpg">Avatar 2</option>
          <option value="3">Avatar 3</option>
          <option value="4">Avatar 4</option>
        </select>
        </div>
        
        <div>
          <button id="addPlayer" class="btn mt-4">Ajouter Joueur</button>
        </div>
      </form>
    </div>` : ''}
    <button id="start-game" class="btn mt-4">Start Game</button>
    </div>
  `;
  this.attachEvent(this, '#playerAvatar', 'change',  () => {
    console.log('changed');
    const select = this.querySelector('#playerAvatar') as HTMLSelectElement;
    const backgroundImage = select.options[select.selectedIndex].getAttribute('data-image');
    const avatarPreview = this.querySelector('#avatarPreviewSelected') as HTMLElement;
    if (avatarPreview) {
      avatarPreview.innerHTML = `
        <img src="${backgroundImage?.startsWith('http') ? backgroundImage : backgroundImage ? `https://localhost:4433/${backgroundImage}` : undefined}" alt="avatar" width="50" height="50"/>
      `;
    }
  });
   this.attachEvent(this, '#difficulty', 'input', this.handleDifficultyChange.bind(this));
   this.attachEvent(this, '#maxPlayer', 'input', this.handleMaxPlayerChange.bind(this));
   this.attachEvent(this, '#setType', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    // Vérifiez si le bouton a l'attribut data-type
    const type = target.getAttribute('data-type');
    if (type) {
      this.setType(type);
    }
  });
  this.attachEvent(this, '#setFormat', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    const type = target.getAttribute('data-type');
    if (type) {
      this.setFormat(type);
    }
  });

  this.attachEvent(this, '#setMode', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    const type = target.getAttribute('data-type');
    if (type) {
      this.setMode(type);
    }
  });
  this.attachEvent(this, '#addIA', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    if (this.state.players?.length === 4) {
      alert('Vous ne pouvez pas ajouter plus de 4 joueurs.');
      return;
    }
    const newPlayer: Players = {
      type: 'local',
      display_name: `IA-${this.state.players?.length?this.state.players.length + 1: 1}`,
      avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
      score: 0,
      is_IA:true,
      user: null,
    };
    this.setState({ players: [...this.state.players!, newPlayer] });
    this.render(); // Re-render the component to show the updated player list
    
  });

  this.attachEvent(this, '#addPlayerForm', 'submit', (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const playerName = formData.get('playerName') as string;
    const playerAvatar = formData.get('playerAvatar') as string;
    const newPlayer: Players = {
      type: "local",
      display_name: playerName,
      avatar: playerAvatar,
      score: 0,
      is_IA:false,
      user: null,
    };
    this.setState({ players: [...this.state.players!, newPlayer] });
    form.reset(); // Réinitialiser le formulaire après l'ajout du joueur
    this.render(); // Re-render the component to show the updated player list
  });

  this.attachEvent(this, '#start-game', 'click', this.handlePost.bind(this));


/*   const lobby = this.querySelector('#joinGame') as HTMLElement;
  if (lobby) {
    const lobbyComponent = document.createElement('join-game-component');
    lobby.appendChild(lobbyComponent);
  } */
  }
}
