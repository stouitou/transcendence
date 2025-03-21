import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
// import { Tournament } from '../entities/Tournament.js';
import { Game } from '../entities/Game.js';

@customElement('game-component')
export class  oneVSone extends LitElement {
  @property({ type: String }) canvasId: string = "pongCanvas";

  /* ATTRIBUTES */
  private _canvas: HTMLCanvasElement | null = null;
  private _game!: Game;

  /* CONSTRUCTOR */
	constructor () {
    super();
  }

  firstUpdated () {
    this._canvas = window.document.getElementById(this.canvasId) as HTMLCanvasElement | null;
    if (!this._canvas) {
      throw new Error("No canvas found");
    }
    
    this._canvas.style.background = 'rgb(0, 87, 0)';
    
    const player1 = new Player("First", this._canvas);
    const player2 = new Player("Second", this._canvas);
    
    // const players: Player[] = [player1, player2];
  
    this._game = new Game(player1, player2, this._canvas);
    this._game.launch();
  }
  
  render () {
    return html`
      <div class="game">
        <p>Pong Game Component</p>
      </div>
    `;
  }

  static styles = css`
  
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative; /* Assurez-vous que le positionnement est relatif */
    width: 100%;
    height: 50vh;
    }
    `;
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('pong-game', PongGame);
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}