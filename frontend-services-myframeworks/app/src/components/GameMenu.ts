/* src/GameMenu.ts
   Minimal lobby with three buttons that emits:  game-select → { mode }
*/
type GameMode = 'local' | 'multiplayer' | 'tournament';

export class GameMenu extends HTMLElement {
    constructor() {
        super();
        const sh = this.attachShadow({ mode: 'open' });

        sh.innerHTML = /*html*/`
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
        <div class="flex flex-col gap-6 items-center mt-24 relative z-20">
            <button class="px-10 py-4 text-[1.05rem] border-none rounded-lg bg-indigo-600 text-white cursor-pointer transition-transform duration-150 ease-in hover:-translate-y-0.5">
            Start local game
            </button>
            <button class="px-10 py-4 text-[1.05rem] border-none rounded-lg bg-indigo-600 text-white cursor-pointer transition-transform duration-150 ease-in hover:-translate-y-0.5">
            Start multiplayer
            </button>
            <button class="px-10 py-4 text-[1.05rem] border-none rounded-lg bg-indigo-600 text-white cursor-pointer transition-transform duration-150 ease-in hover:-translate-y-0.5">
            Start tournament
            </button>
        </div>
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
