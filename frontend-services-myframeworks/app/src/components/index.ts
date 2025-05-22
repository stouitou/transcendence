
import { PongComponent } from './game';
import { NavBarComponent } from './navbar/NavBar';
import { BackgroundCanvas } from './background/background';
import { OnlineComponent } from './online-component';
import { ProfileEdit } from './ProfileEdit';

if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavBarComponent);
}

if (!customElements.get('background-canvas-component')) {
  customElements.define('background-canvas-component', BackgroundCanvas);
}

if (!customElements.get('pong-game')) {
  customElements.define('pong-game', PongComponent);
}

if (!customElements.get('is-online-component')) {
  customElements.define('is-online-component', OnlineComponent);
}

if (!customElements.get('profile-edit-component')) {
  customElements.define('profile-edit-component', ProfileEdit);
}