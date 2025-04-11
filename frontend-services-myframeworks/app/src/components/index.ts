import { PongComponent } from './game.ts';
import { NavBarComponent } from './navbar/NavBar.ts';
import { BackgroundCanvas } from './background/background.ts';
import { OnlineComponent } from './online-component.ts';


customElements.define('navbar-component', NavBarComponent);
customElements.define('background-canvas-component', BackgroundCanvas);
customElements.define('pong-game', PongComponent);

if (!customElements.get('is-online-component')) {
  customElements.define('is-online-component', OnlineComponent);
}

