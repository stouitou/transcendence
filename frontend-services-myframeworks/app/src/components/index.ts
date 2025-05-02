/*********************************************************************
 * index.ts – single-page bootstrap (no router, uses <div id="app">)
 * -------------------------------------------------------------------
 *  • <navbar-component>, <is-online-component> and
 *    <background-canvas-component> are already in your HTML, so we
 *    don’t append them again here.
 *  • The script only mounts <game-menu> and later swaps it for
 *    <pong-game>.
 *********************************************************************/

import { GameMenu } from './GameMenu.ts';
import { PongComponent }      from './game.ts';
import { NavBarComponent }    from './navbar/NavBar.ts';
import { BackgroundCanvas }   from './background/background.ts';
import { OnlineComponent }    from './online-component.ts';

if (!customElements.get('game-menu')) {
  customElements.define('game-menu', GameMenu);
}

/* If your PongComponent does NOT self-register, uncomment this: */
// import { PongComponent } from './game.ts';
// if (!customElements.get('pong-game')) {
//   customElements.define('pong-game', PongComponent);
// }

/* ─────────── mount UI ─────────── */
window.addEventListener('DOMContentLoaded', () => {
  /* Grab the z-10 wrapper so the menu sits above the canvas */
  const wrapper = document.querySelector('.relative.z-10.w-full.h-full') as HTMLElement | null;
  if (!wrapper) {
    console.error('❌  wrapper ".relative.z-10.w-full.h-full" not found');
    return;
  }

  /* 1 ▸ show Game Menu */
  const menu = document.createElement('game-menu');
  wrapper.appendChild(menu);

  /* 2 ▸ swap to game on selection */
  menu.addEventListener('game-select', (e: CustomEvent<{ mode: string }>) => {
    const game = document.createElement('pong-game');
    game.setAttribute('mode', e.detail.mode);     // 'local' | 'multiplayer' | 'tournament'
    wrapper.replaceChild(game, menu);
  });
});