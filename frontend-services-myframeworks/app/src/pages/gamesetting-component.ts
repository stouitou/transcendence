import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import {User, Players } from "../types/types";
import { IWebSocketsService } from "../globalstate/WebSocketService";
import { SettingsGameFormData } from "../types/forms.type";
import { settingsGamePlayerconstraint } from "../utils/constraints";

interface IGameSettingState {
  user: User | null;
  difficulty: number;
  type: string;
  format: string;
  max_players: number;
  players?: Players[];
  ws?: IWebSocketsService | null;
}

export class GameSetting extends BaseComponent<IGameSettingState, SettingsGameFormData> {
  iaIndex: number = 0;

  constructor() {
    super({ user: null, difficulty: 1,type:'local',format:'classic',
      players:[{
        type: 'local',
        is_IA:false,
        avatar: "/uploads/1-avatartest.jpg",
        display_name: 'Player 1',
        score: 0,
        user: null
      }],
    max_players: 4,ws:null });
  }

  attachAllForm() {
    try {
      // attach the form handler to the form
      const formHandlerAddPlayer = this.addForm('addPlayerForm');      
      // add the validation constraints to the form handler
      formHandlerAddPlayer?.addValidation(settingsGamePlayerconstraint);  
      // attach the event handler to the form
      this.attachEvent(this, '#addPlayerForm', 'submit', this.handleSubmitAddPlayerForm.bind(this));
    } catch (error) {
        console.log('Error attaching form handler:', error);
    }

    this.attachEvent(this, '#addIA', 'click', (e: Event) => {
      e.preventDefault();
      const form = this.querySelector('#addPlayerForm') as HTMLFormElement;
      if (form) {
        form.querySelector('input[name="display_name"]')?.setAttribute('value', `IA-${this.iaIndex}`);
        form.querySelector('input[name="avatar"]')?.setAttribute('value', '/uploads/1-avatartest.jpg');
        form.querySelector('input[name="is_IA"]')?.setAttribute('value', 'true');
        form.querySelector('input[name="user"]')?.setAttribute('value', '');
        // les ia ne sont autorisé que pour des parties classic et local
        form.querySelector('input[name="is_format"]')?.setAttribute('value', 
          (this.state.type === 'local' && this.state.format === 'classic')?'true': 'false');
        //submit the form to add the player
        form.requestSubmit();
        this.iaIndex++;
      }
    });
  }

  handlePost = async (e: Event) => {
    if (!this.state.players) {
       this.showMessage('Please add player before create game', 'error');
      return ;
    }
    if (this.state.players.length < 3 && this.state.type === 'local' && this.state.format === 'tournament') {
      this.showMessage('Please add at least 3 players before creating a local game.', 'error');
      return ;
    }
    if (this.state.players.length < 2 && this.state.type === 'local') {
      this.showMessage('Please add at least 2 players before creating a local game.', 'error');
      return ;
    }
    e.preventDefault();
    const config = {
      players: this.state.players,
      type: this.state.type,
      format: this.state.format,
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

  resetplayers() {
    const type = this.state.type;
    const setplayer = this.state.players![0];
    if (type === 'remote') {
      setplayer.type = 'remote';
      setplayer.is_IA = false;
      setplayer.user = this.state.user!.id;
    }
    if (type === 'local') { 
      setplayer.type = 'local';
      setplayer.is_IA = false;
      setplayer.user = null;
    }

    if (this.state.format === 'tournament') {
      this.state.max_players = 16;
    }else {
      this.state.max_players = 4;
    }
    this.setState({ ...this.state, players: [setplayer] });
  }
  setType(type: string) {
    this.setState({ ...this.state, type });
    this.resetplayers();
    this.render();
  }
  setFormat(format: string) {
    this.setState({ ...this.state, format });
    this.resetplayers();
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
      <h3 class="text-lg font-semibold">${this.t("GAME.GAME_DIFF")}</h3>

      <div class="relative w-full h-3 mt-4 rounded-full bg-white/40 overflow-hidden">
        <div id="progress"
             class="game-settings-progress-bar"
             style="width:${percentage}%">
        </div>
        <input type="range" id="difficulty" min="1" max="5" value="${difficulty}"
               class="slider-thumb w-full h-full opacity-0 cursor-pointer">
      </div>

      <p class="mt-2 text-sm">${this.t("GAME.ACT_DIFF")}: <b>${difficulty}</b></p>
    </div>

    <!-- ── 2. toggles (IDs unchanged so old listeners keep working) ────── -->
    <div class="block flex flex-col items-center gap-4">

      <div id="setType" class="toggle-row">
        <button class="btn toggle-btn ${type==='local' ? 'on':'off'}"  data-type="local">${this.t("GAME.LOCAL")}</button>
        <button class="btn toggle-btn ${type!=='local'? 'on':'off'}"    data-type="remote">${this.t("GAME.REMOTE")}</button>
      </div>

      <div id="setFormat" class="toggle-row">
        <button class="btn toggle-btn ${format==='classic' ? 'on':'off'}" data-type="classic">${this.t("GAME.CLASSIC")}</button>
        <button class="btn toggle-btn ${format!=='classic'? 'on':'off'}"  data-type="tournament">${this.t("TOURNAMENT.TITLE")}</button>
      </div>

     <!-- <div id="setMode" class="toggle-row">
        <button class="btn toggle-btn {mode==='normal' ? 'on':'off'}"  data-type="normal">${this.t("GAME.NORMAL")}</button>
        <button class="btn toggle-btn {mode==='advanced' ? 'on':'off'}" data-type="advanced">${this.t("GAME.ADVANCED")}</button>
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
      ${format != 'tournament'? `
        <button id="addIA" class="action-btn w-full mb-6">${this.t("GAME.AI")}</button>
      ` : ''}

      <form id="addPlayerForm" class="space-y-6">
			<div id="message-box" class="font-bold text-center mb-4"></div>

      <!-- hidden field -->
      <div id="is_format-error" class="error-message "></div>
      <input type="hidden" name="is_format" value="true">

      <div id="type-error" class="error-message "></div>
      <input type="hidden" name="type" value="${this.state.type}">

      <div id="is_max_players-error" class="error-message "></div>
      <input type="hidden" name="is_max_players" value="${(this.state.players?.length?? 0) >= this.state.max_players? 'true' : 'false'}">
      
      <div id="is_IA-error" class="error-message "></div>
      <input type="hidden" name="is_IA" value="false">

      <div id="user-error" class="error-message "></div>
      <input type="hidden" name="user" value="">

      <div id="avatar-error" class="error-message "></div>
      <div id="display_name-error" class="error-message "></div>

        <div>
          <label class="label" for="display_name">${this.t("GAME.PLAYER_NAME")} :</label>
          <input id="display_name" name="display_name" required class="input w-full">
        </div>
        <div>
          <label class="label" for="avatar">Avatar :</label>
          <div class="flex items-center gap-4">
            <div id="avatarPreviewSelected">
              <img src="/uploads/1-avatartest.jpg" class="avatar-cell-img">
            </div>
            <select id="playerAvatar" name="avatar" class="input flex-1">
              <option data-image="/uploads/1-avatartest.jpg" value="/uploads/1-avatartest.jpg">Avatar 1</option>
              <option data-image="/uploads/avatar2.jpg"   value="/uploads/avatar2.jpg">Avatar 2</option>
            </select>
          </div>
        </div>

        <button id="addPlayer" class="action-btn w-full">${this.t("GAME.PLAYER_ADD")}</button>
      </form>
    </div>` : '' }

    <!-- ── 7. start button ─────────────────────────────────────────────── -->
    <div class="block flex justify-center">
      <button id="start-game" class="action-btn w-56">${this.t("GAME.PHRASE")}</button>
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

  this.attachAllForm();

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

  handleSubmitAddPlayerForm(e: Event) {
      e.preventDefault()
      const formHandler = this.getFormHandler('addPlayerForm');
      if (!formHandler?.validateForm()) {
        this.showMessage('Please fix the errors in the form.', 'error');
        return;
      }
      try {
        const formData = formHandler.getFormData();
        //check player unique name
        const playerName = formData.display_name;
        const existingPlayer = this.state.players?.find(p => p.display_name === playerName);
        console.log('existingPlayer', existingPlayer);
        if (existingPlayer) {
          this.showMessage(`Player with name ${playerName} already exists.`, 'error');
          return;
        }
        const newPlayer: Players = {
          type: "local",
          display_name: playerName,
          avatar: formData.avatar,
          score: 0,
          is_IA:formData.is_IA === 'true',
          user: null,
        };
        this.setState({ players: [...this.state.players!, newPlayer] });
        const form = this.querySelector('#addPlayerForm') as HTMLFormElement;
        if (form) {
          form.reset(); // Réinitialiser le formulaire après l'ajout du joueur
          this.render(); // Re-render the component to show the updated player list
        }
      } catch (error) {
        this.apiErrorHandler(error);
      }
    }

}
