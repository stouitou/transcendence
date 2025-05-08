/* src/GameMenu.ts
   Minimal lobby with three buttons that emits:  game-select → { mode }
*/
type GameMode = 'local' | 'multiplayer' | 'tournament';

export class GameMenu extends HTMLElement {
    constructor() {
        super();
        const sh = this.attachShadow({ mode: 'open' });

        sh.innerHTML = /*html*/`
      <style>
        :host   { display:flex; flex-direction:column; gap:1.4rem;
+           align-items:center; margin-top:6rem;
+           position:relative; z-index:20; }   /* ← NEW */
        button  { padding:1rem 2.4rem; font-size:1.05rem;
                  border:none; border-radius:.55rem;
                  background:#4f46e5; color:#fff; cursor:pointer;
                  transition:transform .15s ease; }
        button:hover { transform:translateY(-2px); }
      </style>

      <button id="local">Start local game</button>
      <button id="multi">Start multiplayer</button>
      <button id="tourn">Start tournament</button>
    `;
    }

    connectedCallback() {
        const $ = (id: string) => this.shadowRoot!.getElementById(id)!;

        $('local').addEventListener('click', () => this.fire('local'));
        $('multi').addEventListener('click', () => this.fire('multiplayer'));
        $('tourn').addEventListener('click', () => this.fire('tournament'));
    }

    private fire(mode: GameMode) {
        this.dispatchEvent(new CustomEvent('game-select', {
            bubbles: true, composed: true, detail: { mode }
        }));
    }
}

!customElements.get('game-menu') &&
customElements.define('game-menu', GameMenu);
