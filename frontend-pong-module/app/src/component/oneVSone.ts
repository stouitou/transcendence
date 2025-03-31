import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Game } from '../entities/Game.js';

@customElement('game-component')
export class  oneVSone extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = "gameWrapper";

  /* ATTRIBUTES */
  private _container: HTMLDivElement | null = null;
  private _area: HTMLCanvasElement | null = null;
  private _game!: Game;
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
    header {
      margin: 0;
      padding: 2px;
      border: block;
      width: 100%;
      height: 200px;
    }
  `;

  /* CONSTRUCTOR */
	constructor () {
    super();
    console.log("Starting game...");
  }

  firstUpdated () {
    this._container = window.document.getElementById(this.gameContainerId) as HTMLDivElement | null;
    if (!this._container) {
      throw new Error("No game container found");
    }

    this._container.style.width = "700px";
    this._container.style.height = "500px";
    this._container.style.overflow = "hidden";
    this._container.style.position = "absolute";
    // this._container.style.top = "50vh";
    // this._container.style.left = "50vw";
    // this._container.style.transform = "translate(-50%, -50%)";
    this._container.style.margin = "0%";
    this._container.style.padding = "0%";
    this._container.style.border = "none";
    // this._container.style.background = "rgb(0, 0, 0)";
    this._container.style.textAlign = "center";

    this._area = document.createElement("canvas");
    if (!this._area)
        throw new Error("Impossible to create game area");
    this._area.width = 700;
    this._area.height = 500;
    this._container.appendChild(this._area);

    const player1 = new Player("First", this._area);
    const player2 = new Player("Second", this._area);
    const players: Player[] = [player1, player2];

    this._game = new Game(players, this._area);
    this._game.launch();
  }
  
  render () {
    return html`<div>Game content here</div>
    `;
  }

  // static styles = css`

  // .game {
  //   display: flex;
  //   flex-direction: column;
  //   align-items: center;
  //   justify-content: center;
  //   position: relative; /* Assurez-vous que le positionnement est relatif */
  //   width: 100%;
  //   height: 50vh;
  //   }
  //   `;
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('game-component', OneVSone);
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}