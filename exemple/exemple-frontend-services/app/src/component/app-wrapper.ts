import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-wrapper')
export class AppWrapper extends LitElement {
  @state()
  private count = 0;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
  `;

  constructor() {
    super();
    this._incrementCount = this._incrementCount.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('increment', this._incrementCount as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('increment', this._incrementCount as EventListener);
    super.disconnectedCallback();
  }

  private _incrementCount() {
    this.count++;
    console.log('Count incremented:', this.count);
  }

  render() {
    return html`
      <nav-bar></nav-bar>
      <game-component></game-component>
      <footer-component .count=${this.count}></footer-component>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-wrapper': AppWrapper;
  }
}