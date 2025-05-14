import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Tournament } from '../entities/Tournament.js';
import { Round } from '../models/Round.model.js';

@customElement('tournament-component')
export class  TournamentGame extends LitElement {
  @property({ type: Object })
  config: { id: number } = { id: 0 };

  /* ATTRIBUTES */
  private _area: HTMLDivElement | null = null;

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
    this._area = window.document.getElementById('gameWrapper') as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }

    try {
      this.launchTournament();
    }
    catch (error) {
      console.error(error);
    }
  }

  private async launchTournament () {
    const url = 'https://localhost:4433/api/game-management-service/tournaments/' + this.config.id;

    try {
      const reply = await fetch(url);
      if (!reply.ok) {
        console.warn(`Server responded with status ${reply.status}`);
        throw new Error("Failed to fetch tournament in database");
      }
      const tournament = await reply.json();
      const players: Player[] = [];
      tournament.players.forEach((player: any) => { const newPlayer = new Player(player); players.push(newPlayer); });
      console.log('In tournamentGame, tournament: ', tournament);
      const rounds: Round[] = [];
      console.log('in tournamentGame, rounds: ', tournament.rounds);
      tournament.rounds.forEach((round: any) => { const newRound = { id: round.id, games: round.games, state:round.state, current: round.current, player: round.players, created_at: round.created_at, updated_at: round.updated_at, tournaments: round.tournaments}; round.push(newRound); });
      console.log('In tournamentGame, rounds: ', rounds);
      new Tournament(this.config.id, players, this._area!);
    }
    catch (error) {
      console.error('Error to launch tournament: ');
    }
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