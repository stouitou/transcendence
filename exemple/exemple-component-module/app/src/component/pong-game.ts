import { LitElement, html, css } from 'lit';
import { Game } from '../entities/Game';
import { customElement } from 'lit/decorators.js';

@customElement('game-component')
export class PongGame extends LitElement {
	private game:Game;
	constructor() {
		super();
		this.game = new Game();
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
  firstUpdated() {
    this.game.start();
  }
  render() {
    return html`
      <div class="game">
        <p>Pong Game Component</p>
      </div>
    `;
  }
}

// Enregistrement du composant avec une balise personnalisée
//customElements.define('pong-game', PongGame);

declare global {
  interface HTMLElementTagNameMap {
	'game-component': PongGame
  }
}