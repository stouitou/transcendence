
export class RouterConfig {
  private static instance: RouterConfig; // Instance unique
  private _routes: { [path: string]: () => HTMLElement } = {};
  private _currentComponent: HTMLElement | null = null;

  private constructor() {} // Constructeur privé pour empêcher l'instanciation directe

  // Méthode statique pour obtenir l'instance unique
  public static getInstance(): RouterConfig {
    if (!RouterConfig.instance) {
      RouterConfig.instance = new RouterConfig();
    }
    return RouterConfig.instance;
  }

  // Ajouter une route
  public addRoute(path: string, component: () => HTMLElement) {
    this._routes[path] = component;
  }

  public hasRoute(path:string) {
    if (this._routes[path]) {
      return true;
    }
    return false;
  }

  // Naviguer vers une route
  public navigate(path: string) {
    if (this._routes[path]) {
      this.loadComponent(path);
      window.history.pushState({ path }, '', path);
    } else {
      console.error(`Route not found: ${path}`);
    }
  }

  // Charger un composant
  private loadComponent(path: string) {
    const app = document.querySelector('router-view');
    if (!app) {
      console.error('<router-view> not found in the DOM');
      return;
    }

    // Démonter le composant actuel
    if (this._currentComponent) {
      app.removeChild(this._currentComponent);
      this._currentComponent = null;
    }

    // Monter le nouveau composant
    const component = this._routes[path]();
    app.appendChild(component);
    this._currentComponent = component;
  }

  // Gérer les actions "Précédent" et "Suivant"
  public handlePopState(event: PopStateEvent) {
    const path = event.state?.path || '/';
    this.loadComponent(path);
  }
}
const routerConfig = RouterConfig.getInstance();
routerConfig.addRoute('/', () => document.createElement('home-component'));
routerConfig.addRoute('/about', () => document.createElement('about-component'));
routerConfig.addRoute('/game', () => document.createElement('pong-game'));
routerConfig.addRoute('/login', () => document.createElement('login-component'));
routerConfig.addRoute('/profile', () => document.createElement('profile-component'));
routerConfig.addRoute('/register', () => document.createElement('register-component'));
routerConfig.addRoute('/game-history', () => document.createElement('game-history-component'));
routerConfig.addRoute('/game-setting', () => document.createElement('game-setting-component'));
routerConfig.addRoute('/messages', () => document.createElement('chat-component'));
routerConfig.addRoute('/dashboard', () => document.createElement('dashboard-component'));
routerConfig.addRoute('/settings', () => document.createElement('settings-component'));



export class Router extends HTMLElement {
  private routerConfig: RouterConfig;

/*   private routes: { [path: string]: () => HTMLElement } = {};
  private currentComponent: HTMLElement | null = null; */

  constructor() {
    super();
    this.routerConfig = RouterConfig.getInstance(); // Obtenir l'instance unique de RouterConfig
    window.addEventListener('popstate', this.handlePopState.bind(this));
    document.addEventListener('click', this.handleLinkClick.bind(this));
  }
  connectedCallback() {
    // Naviguer vers la route initiale
    const initialPath = window.location.pathname;
    this.routerConfig.navigate(initialPath);
  }

  // Gérer les clics sur les liens de navigation
  private handleLinkClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = (target as HTMLAnchorElement).getAttribute('href');
      if (href && !href.startsWith('http')) {
        event.preventDefault(); // Empêcher le comportement par défaut
        this.routerConfig.navigate(href); // Naviguer via RouterConfig
      }
    }
  }

  // Gérer les actions "Précédent" et "Suivant"
  private handlePopState(event: PopStateEvent) {
    this.routerConfig.handlePopState(event);
  }

    // Naviguer vers une route ne sera pas utilisé
    public  navigate(path: string) {
      this.routerConfig.navigate(path);
    }

}
