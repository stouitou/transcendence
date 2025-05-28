import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import {User, Game, Players } from "../types/types";
import { IWebSocketsService } from "../globalstate/WebSocketService";

class PlayerConfig {
  id?: number | null;
  name: string | null;
  avatar: string | null;
  state: string | null;
  isInGame: boolean;
  isIA: boolean;

  constructor (id: number | null, name: string | null, avatar: string | null, state: string | null, isInGame: boolean, isIA: boolean) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.state = state;
    this.isInGame = isInGame;
    this.isIA = isIA;
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      state: this.state,
      isInGame: this.isInGame,
      isIA: this.isIA
    };
  }
}
class ConfigGame {
  type: string;
  format: string;
  tournamentId: number | null;
  maxPlayers: number;
  isallowedRegistration: boolean;
  gameId: number;
  state: string;
  players?: PlayerConfig[];
  constructor(config:{type: string, format: string, tournamentId: number | null, maxPlayers: number, isallowedRegistration: boolean, gameId: number, state: string, players?: PlayerConfig[]}) {
    this.type = config.type;
    this.format = config.format;
    this.tournamentId = config.tournamentId;
    this.maxPlayers = config.maxPlayers;
    this.isallowedRegistration = config.isallowedRegistration;
    this.gameId = config.gameId;
    this.state = config.state;
    this.players = config.players;
  }
  toJSON() {
    return {
      type: this.type,
      format: this.format,
      tournamentId: this.tournamentId,
      maxPlayers: this.maxPlayers,
      isallowedRegistration: this.isallowedRegistration,
      gameId: this.gameId,
      state: this.state,
      players: this.players
    };
  }
  sendMessage(socket: IWebSocketsService | null | undefined) {
    if (!socket) {
      console.error("WebSocket is not initialized");
      return;
    }
    const message = JSON.stringify({ type: "gameCreate", gameId: this.gameId, config: this });
    console.log("sendMessage bu ConfigGame", message);
    socket.sendMessage(message);
  }
}

export class GameSetting extends BaseComponent<{ user: User | null; difficulty: number,type:string,format:string,/* mode:string, */
  max_players: number, players?: Players[] ,ws?: IWebSocketsService | null}> {
  iaIndex: number = 0;

  constructor() {
    super({ user: null, difficulty: 1,type:'local',format:'classic',/* mode:'normal', */ players:[{
    type: 'local',
    is_IA:false,
    avatar: "/uploads/1-avatartest.jpg",
    display_name: 'Player 1',
    score: 0,
    user: null
    }],
    max_players: 4,ws:null });
  }

  handlePost = async (e: Event) => {
    if (!this.state.players || this.state.players.length < 2) {
      console.log('Please add player before create game');
      return ;
    }
    e.preventDefault();
    const config = {
      players: this.state.players,
      type: this.state.type,
      format: this.state.format,
      // mode: this.state.mode,
      max_players: this.state.max_players,
      isallowedRegistration: true,
      difficulty: this.state.difficulty,
    }
    try {
      const response = await fetch(`/api/auth/ws-csrf`)
      if (!response.ok) {
        console.error('Failed to fetch CSRF token for WebSocket');
        return;
      }
      const wsCSRFToken = await response.json();
      this.state.ws?.sendMessage(JSON.stringify({ type: "gameCreate", gameId: 1, config: config ,wsCSRFToken:wsCSRFToken.token}));
      return;
    } catch (error) {
      console.error('Error fetching CSRF token for WebSocket:', error);
    } 
  };



  connectedCallback() {
    super.connectedCallback();
    this.state.user = UserContext().user();
    this.state.ws = UserContext().ws();
    this.state.players![0].avatar = this.state.user?.avatar;
    this.state.players![0].display_name = this.state.user?.name;
    this.state.players![0].user = this.state.user?.id?? null;
    this.state.players![0].is_IA = false;
    this.render();

    document.addEventListener('profile-data-updated', (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('profile-data-updated event received');
      this.state.user = customEvent.detail.profileData;
      this.state.players![0].avatar = this.state.user?.avatar;
      this.state.players![0].display_name = this.state.user?.name;
      this.state.players![0].user = this.state.user?.id?? null;
      this.state.players![0].is_IA = false;
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
/*   setMode(mode: string) {
    this.setState({ ...this.state, mode });
    this.render();
  } */

  handleDifficultyChange(event: Event) {
    event.preventDefault();
    console.log('handleDifficultyChange');
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.setDifficulty(value);
    console.log('Difficulty changed:', value);
    const progress = this.querySelector('#progress') as HTMLElement;
    if (progress) {
     const percentage = (value ) / (5 ) * 100;
     progress.style.width = percentage + '%';
    }
  }

  handleMaxPlayerChange(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.setRemoteMaxPlayers(value);
    const progress = this.querySelector('#progressMaxPlayer') as HTMLElement;
    if (progress) {
     const percentage = (value ) / (this.state.format==="tournament"?20:4)  * 100;
     progress.style.width = percentage + '%';
    }
  }

  render() {
    const { user, difficulty,type, format,/* mode, */players } = this.state;
    const percentage = (difficulty ) / (5) * 100; // Calculer la largeur initiale
    if (this.state.format === "classic" && this.state.max_players > 4) {
      this.state.max_players = 4;
    }
    const percentageMaxPlayer = (this.state.max_players ) / (format === "tournament"? 20 : 4) * 100; // Calculer la largeur initiale

    this.innerHTML = /*html*/`
  <div class="glass-card wider mx-auto relative">

    <!-- decorative pastel blob behind the card -->

    <!-- ── 1. difficulty slider ───────────────────────────────────────── -->
    <div class="block text-center">
      <h3 class="text-lg font-semibold">Difficulté du jeu</h3>

      <div class="relative w-full h-3 mt-4 rounded-full bg-white/40 overflow-hidden">
        <div id="progress"
             class="game-settings-progress-bar"
             style="width:${percentage}%">
        </div>
        <input type="range" id="difficulty" min="1" max="5" value="${difficulty}"
               class="slider-thumb w-full h-full opacity-0 cursor-pointer">
      </div>

      <p class="mt-2 text-sm">Difficulté actuelle: <b>${difficulty}</b></p>
    </div>

    <!-- ── 2. toggles (IDs unchanged so old listeners keep working) ────── -->
    <div class="block flex flex-col items-center gap-4">

      <div id="setType" class="toggle-row">
        <button class="btn toggle-btn ${type==='local' ? 'on':'off'}"  data-type="local">Local</button>
        <button class="btn toggle-btn ${type!=='local'? 'on':'off'}"    data-type="remote">Remote</button>
      </div>

      <div id="setFormat" class="toggle-row">
        <button class="btn toggle-btn ${format==='classic' ? 'on':'off'}" data-type="classic">Classic</button>
        <button class="btn toggle-btn ${format!=='classic'? 'on':'off'}"  data-type="tournament">Tournament</button>
      </div>

     <!-- <div id="setMode" class="toggle-row">
        <button class="btn toggle-btn {mode==='normal' ? 'on':'off'}"  data-type="normal">Normal</button>
        <button class="btn toggle-btn {mode==='advanced' ? 'on':'off'}" data-type="advanced">Advanced</button>
      </div> -->
    </div>

    <!-- ── 3. summary chips ───────────────────────────────────────────── -->
    <div class="block flex flex-wrap gap-3 justify-center">
      <span class="summary-chip">Type&nbsp;: <b>${type}</b></span>
      <span class="summary-chip">Format&nbsp;: <b>${format}</b></span>
     <!-- <span class="summary-chip">Mode&nbsp;: <b>{mode}</b></span> -->
    </div>

    <!-- ── 4. players table ───────────────────────────────────────────── -->
    <div class="block">
      <table class="player-table w-full text-base">
        <thead><tr><th>#</th><th>Nom</th><th>IA</th><th>Avatar</th></tr></thead>
        <tbody>
          ${
        players
            ? players.map((p,i)=> `
                <tr>
                  <td><span class="idx-chip">${i+1}</span></td>
                  <td><span class="name-cell">${p.display_name ?? '-'}</span></td>
                  <td>
                    <span class="ia-pill ${p.is_IA ? 'on':'human'}">
                      ${p.is_IA ? 'IA' : 'Human'}
                    </span>
                  </td>
                  <td >
                    <img
                        class="avatar"
                        referrerpolicy="no-referrer"
                        alt="Avatar de ${p.display_name}"
                     src="${
                p.avatar?.startsWith('http')
                    ? p.avatar
                    : (p.avatar ? p.avatar : '')
            }">
                  </td>
                  <td>${i !== 0 ? `<span class="action-btn rem-chip" data-name="${p.display_name}">X</span>` : ``}</td>
                </tr>`).join('')
            : ''
    }
        </tbody>
      </table>
    </div>

    <!-- ── 5. remote-only max-players slider ──────────────────────────── -->
    ${ type==='remote' ? `
    <div class="block text-center space-y-3">
      <h3 class="text-lg font-semibold">Nombre maximum de joueurs</h3>
      <div class="relative w-full h-3 rounded-full bg-white/40 overflow-hidden">
        <div id="progressMaxPlayer"
             class="game-settings-progress-bar"
             style="width:${percentageMaxPlayer}%"></div>
        <input type="range" id="maxPlayer"
               min="1" max="${format==='tournament'?20:4}"
               value="${this.state.max_players}"
               class="slider-thumb w-full h-full opacity-0 cursor-pointer">
      </div>
      <span class="text-sm">Max actuel&nbsp;: <b>${this.state.max_players}</b></span>
    </div>` : '' }

    <!-- ── 6. local-only IA button and add-player form ─────────────────── -->
    ${ type==='local' ? `
    <div class="block">
      <button id="addIA" class="action-btn w-full mb-6">Ajouter une IA</button>

      <form id="addPlayerForm" class="space-y-6">
        <div>
          <label class="label" for="playerName">Nom du joueur :</label>
          <input id="playerName" name="playerName" required class="input w-full">
        </div>
        <div>
          <label class="label" for="playerAvatar">Avatar :</label>
          <div class="flex items-center gap-4">
            <div id="avatarPreviewSelected">
              <img src="/uploads/1-avatartest.jpg" class="avatar-cell-img">
            </div>
            <select id="playerAvatar" name="playerAvatar" class="input flex-1">
              <option data-image="/uploads/1-avatartest.jpg" value="/uploads/1-avatartest.jpg">Avatar 1</option>
              <option data-image="/uploads/avatar2.jpg"   value="/uploads/avatar2.jpg">Avatar 2</option>
        <!--      <option value="3">Avatar 3</option>
              <option value="4">Avatar 4</option> -->
            </select>
          </div>
        </div>

        <button id="addPlayer" class="action-btn w-full">Ajouter Joueur</button>
      </form>
    </div>` : '' }

    <!-- ── 7. start button ─────────────────────────────────────────────── -->
    <div class="block flex justify-center">
      <button id="start-game" class="action-btn w-56">Create Game</button>
    </div>
  </div>
`;



    this.attachEvent(this, '#playerAvatar', 'change', () => {
    console.log('changed');
    const select = this.querySelector('#playerAvatar') as HTMLSelectElement;
    const backgroundImage = select.options[select.selectedIndex].getAttribute('data-image');
    const avatarPreview = this.querySelector('#avatarPreviewSelected') as HTMLElement;
    if (avatarPreview) {
      avatarPreview.innerHTML = `
        <img src="${backgroundImage?.startsWith('http') ? backgroundImage : backgroundImage ? `${backgroundImage}` : undefined}" alt="avatar" width="50" height="50"/>
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

/*   this.attachEvent(this, '#setMode', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    const type = target.getAttribute('data-type');
    if (type) {
      this.setMode(type);
    }
  }); */
  this.attachEvent(this, '#addIA', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return; // le clic provient d'un bouton
    if (this.state.players?.length === 4) {
      alert('Vous ne pouvez pas ajouter plus de 4 joueurs.');
      return;
    }
    const newPlayer: Players = {
      type: 'local',
      display_name: `IA-${this.iaIndex}`,
      avatar: '/uploads/1-avatartest.jpg',
      score: 0,
      is_IA:true,
      user: null,
    };
    this.iaIndex++;
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
    
  this.attachEvent(this, 'tbody', 'click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('rem-chip'))  { return ; }

    const playerName = target.dataset.name;
    console.log('You clicked on', playerName);
    const players = [...(this.state.players ?? [])];
    const indexToRemove = players.findIndex(p => p.display_name === playerName);

    if (indexToRemove !== -1) {
      players.splice(indexToRemove, 1);
      this.setState({ players });
      this.render();
    }
  })
  }

}
