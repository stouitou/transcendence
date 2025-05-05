import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match } from '../entities/Match.js';
import { Bot } from '../entities/Bot.js';
import { Real } from '../entities/Real.js';

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
    #gameWrapper {
      position: relative;
      overflow: hidden;
      maging: 0;
      padding: 0;
      border: none;
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

    this.setupGame();
  }
  
  private async setupGame () {
    try {
      this._game = new Match(this._area);
      // this._game.addPlayer(new Real({name: 'Host', role: 'user', level: 1}));
      // this._game.addPlayer(new Real({name: 'Host', role: 'user', level: 1}));
      //  this._game.addPlayer(new Real({name: 'Host', role: 'user', level: 1}));
      //this._game.addPlayer(new Real({name: 'Host', role: 'user', level: 1}));
      this._game.addPlayer(new Real({name: 'Host', role: 'user', level: 1}));

      // this._game.addPlayer(new Bot(1));
      this._game.addPlayer(new Bot(2));
      await this._game.start();
    }
    catch (error) {
      console.error('Error setting up game: ', error);
    }
  }
}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': classic;
  }
}