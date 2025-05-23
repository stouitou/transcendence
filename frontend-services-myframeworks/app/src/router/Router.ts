import { UserContext } from "../globalstate/GlobalState";

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

  //rediriger les requete vers /api vers un unauthorized
/*   public redirectUnauthorized(path:string) {
    if (path.startsWith('/api')) {
      return "/404";
    }
    return path;
  } */

  // Naviguer vers une route
  public navigate(href: string ,replace: boolean = false) {
    const uri = new URL(href, window.location.origin); // Inclure l'origine pour éviter les erreurs
    const pathWithQuery = uri.pathname + uri.search; // Inclure les query strings


    /* if (this._routes[uri.pathname]) {
        this.loadComponent(uri.pathname,uri.searchParams); // Charger le composant avec les query strings
        if (replace) {
          window.history.replaceState({ path: pathWithQuery}, '', href); // Remplacer l'état initial
      } else {
          window.history.pushState({ path: pathWithQuery }, '', href); // Ajouter un nouvel état
      }
    } else {
      console.error(`Route not found: ${href}`);
    } */
   if (this._routes[uri.pathname]) {
        this.loadComponent(uri.pathname,uri.searchParams); // Charger le composant avec les query strings
    } else {
      console.error(`Route not found: ${href}`);
      this.loadComponent("/404",uri.searchParams);
    }
    if (replace) {
        window.history.replaceState({ path: pathWithQuery}, '', href); // Remplacer l'état initial
    } else {
        window.history.pushState({ path: pathWithQuery }, '', href); // Ajouter un nouvel état
    }
  }

  // Charger un composant
  private loadComponent(path: string,searchParams: URLSearchParams | null = null) {
    console.log('Loading component for path:', path);
   // console.log('searchParams:', searchParams);
    const app = document.querySelector('router-view');
    if (!app) {
      console.error('<router-view> not found in the DOM');
      return;
    }

    // Vérifier si l'utilisateur a le rôle admin pour les routes admin
    // 1 -  Vérifier si la route commence par /admin
    if (path.startsWith('/admin')) {
      // 1 - Vérifier si l utilisateur a un role admin
      const user = UserContext().user();
      if ((user && user.role != 'admin') || !user) {
        //2 - Rediriger vers la page 401
        path ='/401';
      }
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
      //console.log('params:', params);
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
routerConfig.addRoute('/game', () => document.createElement('game-component'));//@TODO a rename
//routerConfig.addRoute('/game', () => document.createElement('game-component-classic'));//@TODO a rename
routerConfig.addRoute('/login', () => document.createElement('login-component'));
routerConfig.addRoute('/login-2fa', () => document.createElement('login-two-factor-component'));
//routerConfig.addRoute('/forgot-password', () => document.createElement('forgot-password-component'));
routerConfig.addRoute('/forgot-password', () => document.createElement('forgot-password-request-component'));
routerConfig.addRoute('/forgot-password-2fa', () => document.createElement('forgot-password-two-factor-component'));


routerConfig.addRoute('/reset-password', () => document.createElement('reset-password-component'));
//routerConfig.addRoute('/change-password', () => document.createElement('change-password-component'));
routerConfig.addRoute('/profile', () => document.createElement('profile-component'));
routerConfig.addRoute('/profile/edit', () => document.createElement('profile-edit-component'));
routerConfig.addRoute('/register', () => document.createElement('register-component'));
routerConfig.addRoute('/game-history', () => document.createElement('game-history-component'));
routerConfig.addRoute('/game-setting', () => document.createElement('game-setting-component'));
routerConfig.addRoute('/messages', () => document.createElement('chat-component'));
routerConfig.addRoute('/dashboard', () => document.createElement('dashboard-component'));
routerConfig.addRoute('/settings', () => document.createElement('settings-component'));
routerConfig.addRoute('/support', () => document.createElement('support-component'));
//routerConfig.addRoute('/mentions-legales', () => document.createElement('mentions-legales-component'));
routerConfig.addRoute('/game-loby', () => document.createElement('game-loby-component'));

routerConfig.addRoute('/404', () => document.createElement('error-404-component'));
routerConfig.addRoute('/401', () => document.createElement('error-401-component'));

routerConfig.addRoute('/admin', () => document.createElement('admin-pannel'));
routerConfig.addRoute('/admin/users', () => document.createElement('admin-users'));

export class Router extends HTMLElement {
  private routerConfig: RouterConfig;

/*   private routes: { [path: string]: () => HTMLElement } = {};
  private currentComponent: HTMLElement | null = null; */

  constructor() {
    super();
    console.log('Router constructor');
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
/*         // Vérifier si la route commence par /admin
        if (href.startsWith('/admin')) {
          // Vérifier si l utilisateur a un role admin
          const user = UserContext().user();
          if (user && user.role != 'admin') {
            // Rediriger vers la page 401
            this.routerConfig.navigate('/401');
            return;
          }
        } */

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
