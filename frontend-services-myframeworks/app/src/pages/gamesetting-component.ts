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
             class="absolute inset-0 bg-gradient-to-r
                    from-indigo-300 via-violet-300 to-pink-300 transition-all"
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
                  <td class="avatar-cell">
                    <img
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
             class="absolute inset-0 bg-gradient-to-r
                    from-indigo-300 via-violet-300 to-pink-300 transition-all"
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

  <!-- ── styles (new + your existing ones) ─────────────────────────────── -->
  <style>
    /* card + blob */
    .glass-card{
      backdrop-filter:blur(14px) saturate(1.8);
      background:rgba(255,255,255,.55);
      border:1px solid rgba(255,255,255,.4);
      box-shadow:0 12px 36px rgba(0,0,0,.07);
      border-radius:1.75rem;
      padding:2.5rem 2.25rem;
    }
    .glass-card.wider{max-width:32rem;}  /* ≈520 px */
    .card-blob{
      position:absolute; inset:-40px -50px; z-index:-1;
      filter:blur(28px) opacity(.45);
    }

    /* block separators */
    .block{padding:1.25rem 0;}
    .block + .block{border-top:1px solid rgba(0,0,0,.06);}
    @media(prefers-color-scheme:dark){
      .block + .block{border-top:1px solid rgba(255,255,255,.08);}
    }

    /* toggle row + buttons (keep previous colours) */
    .toggle-row{display:flex;gap:1rem}
    .toggle-btn{padding:.45rem 1.6rem;border-radius:9999px;font-weight:600;font-size:.9rem;transition:.15s}
    .toggle-btn.on {
      background:linear-gradient(135deg,#c7d2fe 0%,#e9d5ff 50%,#fce7f3 100%);
      color:#4338ca; box-shadow:0 2px 8px rgba(145,133,255,.25);
    }
    .toggle-btn.off{
      background:rgba(255,255,255,.5); color:#374151; border:1px solid rgba(0,0,0,.05);
    }

    /* summary chips */
    .summary-chip{background:rgba(145,133,255,.12); color:#4338ca; padding:.35rem .9rem; border-radius:9999px; font-size:.85rem; font-weight:500}

    /* player table */
    .player-table{border-collapse:separate;border-spacing:0 .55rem;table-layout:fixed}
    .player-table th,.player-table td{padding:.55rem 1rem;vertical-align:middle;text-align:left}
    .player-table th{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#6b7280}
    .player-table td:first-child,.player-table th:first-child{text-align:center;width:3.5rem}
    .player-table tbody tr{background:rgba(0,0,0,.02);border-radius:12px;overflow:hidden;transition:.15s}
    .player-table tbody tr:hover{background:rgba(145,133,255,.08)}

    .idx-chip{display:inline-flex;width:2.25rem;height:2.25rem;align-items:center;justify-content:center;border-radius:9999px;background:#fff;box-shadow:inset 0 0 0 2px rgba(145,133,255,.25);font-weight:600}
    .rem-chip{display:inline-flex;width:2.25rem;height:2.25rem;align-items:center;justify-content:center;border-radius:9999px;background:#ddd;box-shadow:inset 0 0 0 2px rgba(145,133,255,.25);font-weight:600}
    .name-cell{display:inline-block;max-width:11rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;color:#111827}
    .ia-pill{display:inline-flex;padding:.15rem .6rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:rgba(145,133,255,.15);color:#4338ca}
    .ia-pill.on{background:linear-gradient(135deg,#c7d2fe,#e9d5ff)}
    .ia-pill.human{background:rgba(96,165,250,.15);color:#0369a1}
    .avatar-cell img,.avatar-cell-img{width:32px;height:32px;border-radius:9999px;object-fit:cover;box-shadow:0 0 0 2px #fff}

    /* global buttons / inputs */
    .action-btn{
      background:linear-gradient(135deg,#c7d2fe 0%,#e9d5ff 50%,#fce7f3 100%);
      color:#4338ca;font-weight:600;padding:.6rem;border-radius:.75rem;box-shadow:0 2px 10px rgba(145,133,255,.35);transition:transform .15s;
    }
    .action-btn:hover{transform:translateY(-2px)}
    .input{border-radius:.75rem;border:1px solid rgba(0,0,0,.1);padding:.45rem .8rem;width:100%;background:rgba(255,255,255,.8)}
    .label{font-weight:500;margin-bottom:.25rem;display:block}

    /* slider thumb (Safari/WebKit) */
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#6366f1;border:none;box-shadow:0 0 0 3px #fff}
    input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#6366f1;border:none}
  </style>
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
