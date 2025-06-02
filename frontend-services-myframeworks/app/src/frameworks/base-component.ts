import  languageContext from "../globalstate/LanguageContext";
import { Language } from "./i18n/types";
import { t, TranslationKey } from './i18n/index';
import { RouterConfig } from "../router/Router";
import { ApiError } from "./base-error";
import { FormHandler } from "./base-form";

interface ApiErrorHandler {
  message?: string; // Message à afficher
  action?: (error: ApiError) => void; // Action spécifique à exécuter
}
export abstract class BaseComponentShadowRoot<TState = {}> extends HTMLElement {
  protected state: TState;
//  public shadowRoot!: ShadowRoot; existe dans la classe HTMLElement

  constructor(initialState: TState) {
    super();
    this.state = initialState;
    this.attachShadow({ mode: 'open' });
  }

  // Fonction pour définir l'état
  setState(newState: any) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Fonction pour déclencher un événement personnalisé
  dispatchCustomEvent(name: string, detail?: any) {
    const event = new CustomEvent(name, { detail });
    this.dispatchEvent(event);
  }
  // Fonction pour attacher les écouteurs d'événements Globaux
  listenCustomEvent(event: string, handler: EventListener) {
    document.addEventListener(event, handler);
 }

  // Fonction à surcharger pour le rendu
  abstract render(): void;

  // Cycle de vie : Appelé lorsque le composant est ajouté au DOM
  connectedCallback() {
    this.render();
  }

  // Cycle de vie : Appelé lorsque le composant est retiré du DOM
  disconnectedCallback() {
    // Nettoyage si nécessaire
  }

  // Cycle de vie : Appelé lorsqu'un attribut est modifié
  attributeChangedCallback(name: string, old: string, newVal: string) {
    // Réagir aux changements d'attributs
  }
  // Fonction pour attacher les écouteurs d'événements
  attachEvent(element: HTMLElement | ShadowRoot , selector: string, event: string, handler: EventListener) {
    const target = element.querySelector(selector);
    if (target) {
      target.addEventListener(event, handler);
    }
  }
}

export abstract class BaseComponent<TState = {}, TForms extends Record<string, any> = {}> extends HTMLElement {
  protected currentLang: Language = languageContext.getLang();
  protected setLang = (lang: Language) => languageContext.setLang(lang);
  private _unsubscribeLang?: () => void;
  protected t(key: TranslationKey): string {
    return t(key, this.currentLang);
  }
  protected router = RouterConfig.getInstance(); 
  protected state: TState;
  private _attachedEvents: { event: string; handler: EventListener }[] = [];
   protected _formHandlers: Map<keyof TForms, FormHandler<any>> = new Map();
  // protected _formHandlers: {divId:string, handler:FormHandler<any>}[] = [];
 //protected _formHandlers: { [K in keyof TForms]?: FormHandler<TForms[K]> } = {};
  constructor(initialState: TState) {
    super();
    this.state = initialState;
    //set le contexte de langue
   this._unsubscribeLang =  languageContext.onChange((lang) => {
      this.currentLang = lang;
      this.render();
    });
    //set apiErrorHandler
    this.setApiErrorHandler(400, {
      message: 'Validation error. Please check your input.',
      action: (error) => {
        console.error('Validation error:', error);
      }
    });
    this.setApiErrorHandler(401, {
      message: 'Unauthorized. Please log in again.',
      action: (error) => {
        console.error('Unauthorized error:', error);
        // Rediriger vers la page de connexion
        //window.location.href = '/login';
        this.router.navigate('/login');
      }
    });
    this.setApiErrorHandler(403, {
      message: 'Access denied. Please contact support.',
      action: (error) => {
        console.error('Access denied error:', error);
        // Afficher un message d'erreur
        this.showMessage('Access denied. Please contact support.', 'error');
      }
    });
  /*   this.setApiErrorHandler(404, {
      message: 'Not found. Please check the URL.',
      action: (error) => {
        console.error('Not found error:', error);
        // Afficher un message d'erreur
        this.showMessage('Not found. Please check the URL.', 'error');
      }
    }); */
      this.setApiErrorHandler(404, {
      message: 'Not found. Please check the URL.',
      action: (error) => {
        console.error('Not found error:', error);
        this.router.navigate('/404');
      }
    });
  }
    // Ajouter un formulaire au composant
  addForm<K extends keyof TForms>(divId: K): FormHandler<TForms[K]> {
    const formElement = this.querySelector(`#${String(divId)}`) as HTMLFormElement;
    if (!formElement) {
      throw new Error(`Form with id "${String(divId)}" not found.`);
    }
    const formHandler = new FormHandler<TForms[K]>(formElement,this.t.bind(this));
    this._formHandlers.set(divId, formHandler);
    return formHandler;
  }

  // Récupérer un gestionnaire de formulaire
  getFormHandler<K extends keyof TForms>(divId: K): FormHandler<TForms[K]> | undefined {
    return this._formHandlers.get(divId);
  }
  // Méthode pour gérer les formulaires
/*   addForm<K extends keyof TForms>(divId: K):FormHandler<TForms[K]>{
    const formElement = this.querySelector(`#${String(divId)}`) as HTMLFormElement;
    if (!formElement) {
      throw new Error(`Form with id "${String(divId)}" not found.`);
    }
    const formHandler = new FormHandler<TForms[K]>(formElement);
    this._formHandlers.push({ divId, handler: formHandler });
    return formHandler;
  }
  getFormHandler(divId: string) {
    const formHandler = this._formHandlers.find((item) => item.divId === divId);
    if (!formHandler) {
      throw new Error(`FormHandler with id "${divId}" not found.`);
    }
    return formHandler.handler;
  } */

  // Méthode pour effectuer des appels API
/*   async apiRequest(endpoint: string, options: RequestInit): Promise<any> {
    return this.apiHandler.request(endpoint, options);
  } */
  // Fonction pour définir l'état
  setState(newState: any) {
    this.state = { ...this.state, ...newState };
  }
  setStateAndRender(newState: any) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Fonction pour déclencher un événement personnalisé
  dispatchCustomEvent(name: string, detail?: any) {
    const event = new CustomEvent(name, { detail });
    this.dispatchEvent(event);
  }
  // Fonction pour attacher les écouteurs d'événements Globaux
  listenCustomEvent(event: string, handler: EventListener) {
     document.addEventListener(event, handler);
     this._attachedEvents.push({ event, handler });
  }

  // Fonction à surcharger pour le rendu
    // Méthode abstraite pour le rendu
    abstract render(): void;

  // Cycle de vie : Appelé lorsque le composant est ajouté au DOM
  connectedCallback() {
    this.render();
  }

   // Nettoyer les gestionnaires de formulaire
  cleanFormHandlers() {
    this._formHandlers.forEach((handler) => {
      handler.cleanEventListeners();
    });
    this._formHandlers.clear();
  }
  // Cycle de vie : Appelé lorsque le composant est retiré du DOM
  disconnectedCallback() {
    // Nettoyage si nécessaire
   // console.log('DisconnectedCallback: Cleaning up events length', this._attachedEvents.length);
    this._attachedEvents.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });    
    this._attachedEvents = [];
   // console.log('DisconnectedCallback: Events cleaned up');
   this.cleanFormHandlers();
/*     this._formHandlers.forEach(({ handler }) => {
      handler.cleanEventListeners();
    });
    this._formHandlers = []; */
    // Nettoyer les écouteurs d'événements Lang
    if (this._unsubscribeLang) {
      this._unsubscribeLang();
      this._unsubscribeLang = undefined;
    }
  
  }

  // Cycle de vie : Appelé lorsqu'un attribut est modifié
  attributeChangedCallback(name: string, old: string, newVal: string) {
    // Réagir aux changements d'attributs
  }

  // Fonction pour attacher les écouteurs d'événements
  attachEvent(element: HTMLElement, selector: string, event: string, handler: EventListener) {
    const target = element.querySelector(selector);
    if (target) {
      target.addEventListener(event, handler);
      this._attachedEvents.push({ event, handler });
    }
  }
    // Fonction pour attacher les écouteurs d'événements
    attachEventOnHtmlElement(element: HTMLElement | SVGElement,  event: string, handler: EventListener) {
      const target = element;
      if (target) {
        target.addEventListener(event, handler);
        this._attachedEvents.push({ event, handler });
      }
    }

    private timeout: NodeJS.Timeout | null = null;
    showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const className = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    };
    const slectedClass = type in className ? className[type] : 'text-gray-500';
    const messageBox = this.querySelector('#message-box') as HTMLElement;
    if (!messageBox) {return; }
      messageBox.textContent = message;
      messageBox.className = slectedClass; // Ajouter une classe CSS pour le style

    //effacer le message après 10 secondes
    this.timeout =  setTimeout(() => {
      if (messageBox) {
        messageBox.innerHTML = '';
        messageBox.className = ''; // Réinitialiser la classe CSS
      }
    }, 10000);
  }

  //protected _apiErrorHandlerAction:{}
  /*
    gestion des erreurs API
    par defaut:
    - 400: Erreur de validation
    - 401: Non autorisé
    - 403: Accès refusé
    - 404: Non trouvé
    - 500: Erreur interne du serveur
    - 502: Erreur de passerelle
    - 503: Service indisponible
    - 504: Délai d'attente de la passerelle
    - 408: Délai d'attente de la requête
    - 429: Trop de requêtes
    - 418: Je suis une théière

    mais possibilite de surcharger , avec une fonction a executer ou modifier le message generique

    un map s'impose:
   interface ApiErrorHandler {
     [status: number]: (error: ApiError) => void;
    }




  */

    protected _apiErrorHandlers: Map<number, ApiErrorHandler> = new Map();
    setApiErrorHandler(statusCode: number, handler: ApiErrorHandler) {
      this._apiErrorHandlers.set(statusCode, handler);
    }
    apiErrorHandler = (error: unknown) => {
       if (error instanceof ApiError) {
    const handler = this._apiErrorHandlers.get(error.statusCode);

    if (handler) {
      // Afficher le message personnalisé ou standard
      const message = handler.message || 'An unexpected error occurred.';
      this.showMessage(message, 'error');

      // Exécuter l'action spécifique si elle est définie
      if (handler.action) {
        handler.action(error);
      }
    } else {
      // Message par défaut si aucun gestionnaire n'est défini pour ce code
      this.showMessage('An unexpected error occurred. Please try again later.', 'error');
    }
  } else {
    // Gérer les erreurs non prévues
    this.showMessage('An unexpected error occurred. Please try again later.', 'error');
  }
    } 
}
