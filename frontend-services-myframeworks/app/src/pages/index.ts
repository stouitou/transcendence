import { GameHistory } from "./gameHistory-component";
import { GameSetting } from "./gamesetting-component";
import { Login } from "./login-component";
//import { Profile } from "./profile-component";
import { ProfilePage } from "./profile-component";
import { Register } from "./register";

import { ChatComponent } from './chat-component';
import { TournamentHistory } from "./tounamentHistory-component";
import { Dashboard } from "./dashboard-test-component";
import { GameLobyComponent } from "./game-loby-componemt";
import { Home } from "./home-component";
import { GameMenu } from "../components/GameMenu";


/* class HomeComponent extends HTMLElement {
	connectedCallback() {
	  this.innerHTML = `<h1>Welcome to the Home Page</h1>
	  <p>Click the links below to navigate:</p>
	 `;
	}
  } */
  
  class AboutComponent extends HTMLElement {
	connectedCallback() {
	  this.innerHTML = `<h1>About Us</h1>`;
	}
  }
  if (!customElements.get('game-menu')) {
	customElements.define('game-menu', GameMenu);
  }
  if (!customElements.get('home-component')) {
	customElements.define('home-component', Home);
  }
  customElements.define('about-component', AboutComponent);
if (!customElements.get('game-history-component')) {
	customElements.define('game-history-component', GameHistory);
}
if (!customElements.get('tournament-history-component')) {
	customElements.define('tournament-history-component', TournamentHistory);
}
if (!customElements.get('profile-component')) {
	customElements.define('profile-component', ProfilePage);
}

if (!customElements.get('login-component')) {
	customElements.define('login-component', Login);
}

if (!customElements.get('register-component')) {
	customElements.define('register-component', Register);
}

if (!customElements.get('game-setting-component')) {
	customElements.define('game-setting-component', GameSetting);
}

if (!customElements.get('chat-component')) {
  customElements.define('chat-component', ChatComponent);
}

if (!customElements.get('dashboard-component')) {
	customElements.define('dashboard-component', Dashboard);
}


if (!customElements.get('game-loby-component')) {
	customElements.define('game-loby-component', GameLobyComponent);
}
