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

export abstract class BaseComponent<TState = {}> extends HTMLElement {
  protected state: TState;

  constructor(initialState: TState) {
    super();
    this.state = initialState;
  }

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
  }

  // Fonction à surcharger pour le rendu
    // Méthode abstraite pour le rendu
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
  attachEvent(element: HTMLElement, selector: string, event: string, handler: EventListener) {
    const target = element.querySelector(selector);
    if (target) {
      target.addEventListener(event, handler);
    }
  }
}
