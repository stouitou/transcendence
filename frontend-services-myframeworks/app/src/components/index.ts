
import { PongComponent } from './game';
import { NavBarComponent } from './navbar/NavBar';
import { BackgroundCanvas } from './background/background';
import { OnlineComponent } from './online-component';
import { ProfileEdit } from './ProfileEdit';


customElements.define('navbar-component', NavBarComponent);
customElements.define('background-canvas-component', BackgroundCanvas);
customElements.define('pong-game', PongComponent);

if (!customElements.get('is-online-component')) {
  customElements.define('is-online-component', OnlineComponent);
}

if (!customElements.get('profile-edit-component')) {
  customElements.define('profile-edit-component', ProfileEdit);
}