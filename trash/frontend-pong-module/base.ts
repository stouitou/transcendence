import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('user-component')
export class UserComponent extends LitElement {

  @property({ type: String }) name = '';
  @property({ type: Number }) id = '';
  @property({ type: Number }) score = 0;

  render() {
    return html`
      <div class="user">
		<h2>Profile</h2>
        <p>bienvenue  ${this.name}</p>
        <p>Uid: ${this.id}</p>
        <p>Score: ${this.score}</p>
      </div>
    `;
  }
}