import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nav-bar')
export class NavBar extends LitElement {
	@property({ type: Number })
    localcount = 0;

  @property({ type: Array })
  links = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' }
  ];

  static styles = css`
    :host {
      display: block;
      background-color: #333;
      color: white;
      padding: 1rem;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
    }
    li {
      margin: 0 1rem;
    }
    a {
      color: white;
      text-decoration: none;
      font-weight: bold;
    }
    a:hover {
      text-decoration: underline;
    }
  `;
  private _handleClick() {
    const event = new CustomEvent('increment', {
      detail: { message: 'Button clicked' },
      bubbles: true,
      composed: true
    });
	console.log('Button clicked');
    this.dispatchEvent(event);
  }
  private _handleLocalClick() {
    this.localcount++;
  }

  render() {
    return html`
      <nav>
        <h1>My App</h1>
		
		  ${this.localcount}
		  
        <ul>
          ${this.links.map(link => html`
            <li><a href="${link.url}">${link.name}</a></li>
          `)}
        </ul>
		  <button @click=${this._handleClick}>Increment</button>
		  <button @click=${this._handleLocalClick}>local++</button>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nav-bar': NavBar;
  }
}