import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Match } from '../entities/Match.js';
import { createGameDatabase, updateStateGameDatabase } from '../utils/databaseGame.js';
import { Bot } from '../entities/Bot.js';

// Export 'game-component' as a tagname in HTML
@customElement('game-component')
export class  classic extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = 'gameWrapper';

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Match;

  static  style = css`
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
    this._area = window.document.getElementById(this.gameContainerId) as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }

    // Redefine the gameWrapper properties to match with what we need
    this._area.style.position = 'relative';
    this._area.style.overflow = 'hidden';
    this._area.style.margin = '0';
    this._area.style.padding = '0';
    this._area.style.border = 'none';

    this.setupGame();
  }
  
  private async setupGame () {
    try {
      const player: Player = new Player({name: 'Host', role: 'user', level: 1});
      await this.createGame([player, new Bot(1)]);
      // await this.createGame([player, new Bot(1), new Bot(1)]);
      // await this.createGame([player, new Bot(1), new Bot(1), new Bot(1)]);
    }
    catch (error) {
      console.error('Error setting up game: ', error);
    }
  }

  private async createGame (players: Player[]) : Promise<void> {
    createGameDatabase(players, 'classic');
    this._game = new Match(players, this._area);
    await this._game.launch();
    updateStateGameDatabase();
  }

}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': classic;
  }
}