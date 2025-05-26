import { GameHistory } from "./gameHistory-component";
import { GameSetting } from "./gamesetting-component";
import { Login } from "./login-component";
import { ProfileGameHistory, ProfilePage, ProfileTournamentHistory } from "./profile-component";
import { Register } from "./register";

import { ChatComponent } from './chat-component';
import { Dashboard } from "./dashboard-test-component";
import { GameLobyComponent } from "./game-loby-componemt";
import { Home } from "./home-component";
import { GameMenu } from "../components/GameMenu";
import { ResetPassword } from "./reset-password-component";
import { ForgotPasswordRequest } from "./forgot-password-request-component";
import { ForgotPasswordTwoFactor } from "./forgot-password-two-factor-component";
import { LoginTwoFactor } from "./login-two-factor-component";
import { Admin } from "./admin/dashboard";
import { AdminUsers } from "./admin/users";

import { Error401 } from "./error-pages/error-401-component";
import { Error404 } from "./error-pages/error-404-component";
import { Settings } from "./settings-component";
import { SettingsLanguage } from "./settingsLanguage";
import { PopupCookies } from "./popup-cookies";
import { Support } from "./support";
import { Leaderboard } from "./leaderboard";


  
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
/* if (!customElements.get('tournament-history-component')) {
	customElements.define('tournament-history-component', TournamentHistory);
} */
if (!customElements.get('profile-component')) {
	customElements.define('profile-component', ProfilePage);
}
if (!customElements.get('profil-game-stats-component')) {
	customElements.define('profil-game-stats-component', ProfileGameHistory);
}

if (!customElements.get('profil-tournament-stats-component')) {
	customElements.define('profil-tournament-stats-component', ProfileTournamentHistory);
}

if (!customElements.get('login-component')) {
	customElements.define('login-component', Login);
}

if (!customElements.get('login-two-factor-component')) {
	customElements.define('login-two-factor-component', LoginTwoFactor);
}
if (!customElements.get('register-component')) {
	customElements.define('register-component', Register);
}

/* if (!customElements.get('forgot-password-component')) {
	customElements.define('forgot-password-component', ForgotPassword);
} */
if (!customElements.get('forgot-password-request-component')) {
	customElements.define('forgot-password-request-component', ForgotPasswordRequest);
} 
if (!customElements.get('forgot-password-two-factor-component')) {
	customElements.define('forgot-password-two-factor-component', ForgotPasswordTwoFactor);
} 
if (!customElements.get('reset-password-component')) {
	customElements.define('reset-password-component', ResetPassword);
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

if (!customElements.get('settings-component')) {
	customElements.define('settings-component', Settings);
}

if (!customElements.get('language-component')) {
	customElements.define('language-component', SettingsLanguage);
}
if (!customElements.get('game-loby-component')) {
	customElements.define('game-loby-component', GameLobyComponent);
}

if (!customElements.get('error-404-component')) {
	customElements.define('error-404-component', Error404);
}

if (!customElements.get('error-401-component')) {
	customElements.define('error-401-component', Error401);
}

if (!customElements.get('admin-pannel')) {
	customElements.define('admin-pannel', Admin);
}
if (!customElements.get('admin-users')) {
	customElements.define('admin-users', AdminUsers);
}


if (!customElements.get('support-component')) {
	customElements.define('support-component', Support);
}

if (!customElements.get('popup-cookies')) {
	customElements.define('popup-cookies', PopupCookies);
}

if (!customElements.get('leaderbord-component')) {
	customElements.define('leaderboard-component', Leaderboard);
}