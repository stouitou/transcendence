import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Tournament } from '../entities/Tournament.js';
import { createTournamentDatabase } from '../utils/databaseTournament.js';

@customElement('tournament-component')
export class  TournamentGame extends LitElement {
  @property({ type: String }) gameContainerId: string = 'gameWrapper';

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;

  static styles = css`
  :host {
    position: relative;
    width: 100%;
    height: 100%;
  }
  html {
    margin: 0;
    padding: 0;
    border: 0;
    width: 100%;
    height: 100%;
  }
`;

  /* CONSTRUCTOR */
	constructor () {
    super();
  }

  firstUpdated () {
    this._area = window.document.getElementById(this.gameContainerId)! as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }

    this._area.style.position = 'relative';
    this._area.style.overflow = 'hidden';
    this._area.style.margin = '0';
    this._area.style.padding = '0';
    this._area.style.border = 'none';

    this.setupGame();
  }

  private async setupGame () {
    try {
    const player: Player = await this.createPlayer();
  
    const players: Player[] = [player, new Player({name:'Guest1', role:'user'}), new Player({name:'Guest2', role:'user'}), new Player({name:'Guest3', role:'user'}), new Player({name:'Guest4', role:'user'})];
    await this.createGame(players);
    }
    catch (error) {
      console.error('Error setting up game:', error);
    }
  }

  private async createPlayer () : Promise<Player> {
    const url: string = 'https://localhost:4433/api/v2/database/myDb/table/user/id/1';

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Server responded with status ${response.status}`);
        throw new Error("Failed to fetch user data");
      }
      const user = await response.json();
      const player = new Player(user.data);

      return player;
    }
    catch (error) {
      console.error('Error while creating player: ', error);
      return new Player({name: 'Host', role: 'user', level: 1});                           // Backup value for the player if the API call fails
    }
  }

  private async createGame (players: Player[]) : Promise<void> {
    createTournamentDatabase(players.map(player => player.name));
    new Tournament(players, this._area);
  }

  render () {
    return html`
    `;
  }
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('pong-game', PongGame);
declare global {
  interface HTMLElementTagNameMap {
	  'tournament-component': TournamentGame;
  }
}