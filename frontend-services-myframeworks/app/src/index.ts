
import  {Router}  from './router/Router.ts';
customElements.define('app-router', Router);
import './components/index.ts';
import './pages/index.ts';
/* import { PongComponent } from './game.ts';
import { NavBarComponent } from './NavBar.ts';
import { ThemeSwitcherComponent } from './ThemeSwitcher.ts';
import { BackgroundCanvas } from './background.ts';
import { CounterComponent } from './counter.ts';
import  {Router}  from './frameworks/Router.ts';
import { Login } from './login-component.ts';
import { Profile } from './profile-component.ts';

class HomeComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h1>Welcome to the Home Page</h1>`;
  }
}

class AboutComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h1>About Us</h1>`;
  }
}

customElements.define('home-component', HomeComponent);
customElements.define('about-component', AboutComponent);
customElements.define('counter-component', CounterComponent);
customElements.define('theme-switcher', ThemeSwitcherComponent);
customElements.define('navbar-component', NavBarComponent);
customElements.define('background-canvas-component', BackgroundCanvas);
customElements.define('pong-game', PongComponent);
customElements.define('login-component', Login);
customElements.define('app-router', Router);
if (!customElements.get('profile-component')) {
  customElements.define('profile-component', Profile);
} */

//const router = document.querySelector('app-router') as Router;

/* 
router.addRoute('/', () => document.createElement('home-component'));
router.addRoute('/about', () => document.createElement('about-component'));
router.addRoute('/game', () => document.createElement('pong-game'));
router.addRoute('/login', () => document.createElement('login-component')); */

// Naviguer vers la route initiale
/* const initialPath = window.location.pathname;
router.navigate(initialPath); */