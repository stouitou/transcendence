import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('footer-component')
export class FooterComponent extends LitElement {
  @property({ type: Number })
  count = 0;

  static styles = css`
    :host {
      display: block;
      background-color: #333;
      color: white;
      padding: 1rem;
      text-align: center;
    }
  `;




  render() {
    return html`
      <footer>
        <p>Count: ${this.count}</p>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'footer-component': FooterComponent;
  }
}