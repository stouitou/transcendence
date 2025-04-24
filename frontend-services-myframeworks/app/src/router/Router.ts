
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
  public navigate(href: string ,replace: boolean = false) {
    const uri = new URL(href, window.location.origin); // Inclure l'origine pour éviter les erreurs
    const pathWithQuery = uri.pathname + uri.search; // Inclure les query strings


    if (this._routes[uri.pathname]) {
        this.loadComponent(uri.pathname,uri.searchParams); // Charger le composant avec les query strings
        if (replace) {
          window.history.replaceState({ path: pathWithQuery}, '', href); // Remplacer l'état initial
      } else {
          window.history.pushState({ path: pathWithQuery }, '', href); // Ajouter un nouvel état
      }
    } else {
      console.error(`Route not found: ${href}`);
    }
  }

  // Charger un composant
  private loadComponent(path: string,searchParams: URLSearchParams | null = null) {
    console.log('Loading component for path:', path);
    console.log('searchParams:', searchParams);
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
    if (!component) {
      console.error(`Component not found for path: ${path}`);
      return;
    }
    if (searchParams) {
      // Passer les paramètres de recherche au composant
      const params = Object.fromEntries(searchParams.entries());
      (component as any).params = params;
      console.log('params:', params);
    }
    app.appendChild(component);
    this._currentComponent = component;
  }

  // Gérer les actions "Précédent" et "Suivant"
  public handlePopState(event: PopStateEvent) {
    const path = event.state?.path || '/';
    const uri = new URL(path, window.location.origin); // Inclure l'origine pour éviter les erreurs
    this.loadComponent(path,uri.searchParams); // Charger le composant avec les query strings
  }
}
const routerConfig = RouterConfig.getInstance();
routerConfig.addRoute('/', () => document.createElement('home-component'));
routerConfig.addRoute('/about', () => document.createElement('about-component'));
//routerConfig.addRoute('/game', () => document.createElement('pong-game'));
routerConfig.addRoute('/game', () => document.createElement('game-component'));
routerConfig.addRoute('/login', () => document.createElement('login-component'));
routerConfig.addRoute('/profile', () => document.createElement('profile-component'));
routerConfig.addRoute('/register', () => document.createElement('register-component'));
routerConfig.addRoute('/game-history', () => document.createElement('game-history-component'));
routerConfig.addRoute('/game-setting', () => document.createElement('game-setting-component'));
routerConfig.addRoute('/messages', () => document.createElement('chat-component'));
routerConfig.addRoute('/dashboard', () => document.createElement('dashboard-component'));
routerConfig.addRoute('/game-loby', () => document.createElement('game-loby-component'));



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
   // const initialPath = window.location.pathname;
    const initialPath = window.location.href;
    this.routerConfig.navigate(initialPath,true);
  }

  // Gérer les clics sur les liens de navigation
  private handleLinkClick(event: MouseEvent) {
    let target = event.target as HTMLElement;

    // Remonter dans l'arbre DOM pour trouver la balise <a> parente
    while (target && target.tagName !== 'A') {
        target = target.parentElement as HTMLElement;
    }

    if (target && target.tagName === 'A') {
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
