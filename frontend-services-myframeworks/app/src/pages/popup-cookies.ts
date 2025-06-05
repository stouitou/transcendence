import { BaseComponent } from "../frameworks/base-component";

export class PopupCookies extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  /**cookie handler */
   handleAcceptCookies(event: Event) {
    event.preventDefault();
    const popup = this.querySelector('#cookiePopup') as HTMLElement;   
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: true,
        analytics: true,
        marketing: true
      }));
      popup.classList.add('opacity-0');
      setTimeout(() => popup.classList.add('hidden'), 300);
  }
  handleRefuseCookies(event: Event) {
    event.preventDefault();
    const popup = this.querySelector('#cookiePopup') as HTMLElement;   
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: true,
        analytics: false,
        marketing: false
      }));
      popup.classList.add('opacity-0');
      setTimeout(() => popup.classList.add('hidden'), 300);
  }
  handleCustomizeCookies(event: Event) {
    event.preventDefault();
     const settingsPanel = this.querySelector('#cookieSettings') as HTMLElement;
     settingsPanel.classList.toggle('hidden');
  }

  handleSaveCookies(event: Event) {
    event.preventDefault();
    const analyticsToggle = this.querySelector('#analyticsToggle') as HTMLInputElement;
    const marketingToggle = this.querySelector('#marketingToggle') as HTMLInputElement;
    localStorage.setItem('cookieConsent', JSON.stringify({
      functional: true,
      analytics: analyticsToggle.checked,
      marketing: marketingToggle.checked
    }));
    const popup = this.querySelector('#cookiePopup') as HTMLElement;
    popup.classList.add('opacity-0');
    setTimeout(() => popup.classList.add('hidden'), 300);
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // console.log("PopupCookies render");
    this.innerHTML = `
      ${this.renderCookiePopup()}
    `;

    if (localStorage.getItem('cookieConsent')) {
      const popup = this.querySelector('#cookiePopup') as HTMLElement;
      popup?.classList.add('hidden');
    }
    this.attachEvent(this, '#acceptCookies', 'click', this.handleAcceptCookies.bind(this));
    this.attachEvent(this, '#refuseCookies', 'click', this.handleRefuseCookies.bind(this));
    this.attachEvent(this, '#customCookies', 'click', this.handleCustomizeCookies.bind(this));
    this.attachEvent(this, '#savePreferences', 'click', this.handleSaveCookies.bind(this));
  }

  renderCookiePopup() {
    return `
      <div id="cookiePopup" class="cookie-container">
        <h2 class="cookie-title">${this.t("COOKIE.TITLE")}</h2>
        <p class="cookie-header-text">
          ${this.t("COOKIE.TEXT")} 
          <a href="/support" class="cookie-header-text-link">${this.t("COOKIE.LINK")}</a>.
        </p>
        <div class="cookie-buttons-container">
          <button id="customCookies" class="cookie-btn-settings">
            ${this.t("COOKIE.CUSTOMIZE")}
          </button>
          <button id="refuseCookies" class="cookie-btn-refuse">
            ${this.t("COOKIE.REFUSE")}
          </button>
          <button id="acceptCookies" class="cookie-btn-accept">
            ${this.t("COOKIE.ACCEPT")}
          </button>
        </div>

        <div id="cookieSettings" class="cookie-form-container hidden">
          <h3 class="cookie-form-title">${this.t("COOKIE.SETTINGS_TITLE")}</h3>
          <label class="cookie-form-label">
            <span>${this.t("COOKIE.FUNCTIONAL")}</span>
            <input id="functionalToggle" type="checkbox" checked disabled class="cookie-form-input-disabled" />
          </label>
          <label class="cookie-form-label">
            <span>${this.t("COOKIE.ANALYTICS")}</span>
            <input id="analyticsToggle" type="checkbox" class="accent-blue-500" />
          </label>
          <label class="cookie-form-label">
            <span>${this.t("COOKIE.MARKETING")}</span>
            <input id="marketingToggle" type="checkbox" class="accent-pink-500" />
          </label>
          <div class="flex justify-end mt-4">
            <button id="savePreferences" class="cookie-btn-accept">
              ${this.t("COOKIE.SAVE")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
