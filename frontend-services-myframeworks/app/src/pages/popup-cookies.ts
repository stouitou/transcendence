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
     settingsPanel.classList.remove('hidden');
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
    console.log("PopupCookies render");
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
      <div id="cookiePopup" class="fixed bottom-20 right-4 max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-2xl shadow-xl z-50 transition-opacity duration-300">
        <h2 class="text-lg font-semibold mb-2">${this.t("COOKIE.TITLE")}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          ${this.t("COOKIE.TEXT")} 
          <a href="/support" class="text-blue-500 hover:underline">${this.t("COOKIE.LINK")}</a>.
        </p>
        <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end">
          <button id="customCookies" class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            ${this.t("COOKIE.CUSTOMIZE")}
          </button>
          <button id="refuseCookies" class="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm transition">
            ${this.t("COOKIE.REFUSE")}
          </button>
          <button id="acceptCookies" class="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm transition">
            ${this.t("COOKIE.ACCEPT")}
          </button>
        </div>

        <div id="cookieSettings" class="mt-4 hidden border-t pt-4 dark:border-gray-600">
          <h3 class="text-sm font-semibold mb-2">${this.t("COOKIE.SETTINGS_TITLE")}</h3>
          <label class="flex items-center justify-between text-sm mb-1">
            <span>${this.t("COOKIE.FUNCTIONAL")}</span>
            <input id="functionalToggle" type="checkbox" checked disabled class="accent-green-600 cursor-not-allowed" />
          </label>
          <label class="flex items-center justify-between text-sm mb-1">
            <span>${this.t("COOKIE.ANALYTICS")}</span>
            <input id="analyticsToggle" type="checkbox" class="accent-blue-500" />
          </label>
          <label class="flex items-center justify-between text-sm mb-3">
            <span>${this.t("COOKIE.MARKETING")}</span>
            <input id="marketingToggle" type="checkbox" class="accent-pink-500" />
          </label>
          <div class="flex justify-end">
            <button id="savePreferences" class="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm">
              ${this.t("COOKIE.SAVE")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
