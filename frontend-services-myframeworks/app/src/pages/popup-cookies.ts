import { BaseComponent } from "../frameworks/base-component.ts";
import { LanguageContext } from "../globalstate/LanguageContext.ts";
import { t } from "../i18n/translations.ts";

export class PopupCookies extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    super.connectedCallback();
    this.render();

    const popup = this.querySelector('#cookiePopup') as HTMLElement;
    const acceptBtn = this.querySelector('#acceptCookies');
    const refuseBtn = this.querySelector('#refuseCookies');
    const customBtn = this.querySelector('#customCookies');
    const saveBtn = this.querySelector('#savePreferences');

    const analyticsToggle = this.querySelector('#analyticsToggle') as HTMLInputElement;
    const marketingToggle = this.querySelector('#marketingToggle') as HTMLInputElement;
    const settingsPanel = this.querySelector('#cookieSettings') as HTMLElement;

    if (localStorage.getItem('cookieConsent')) {
      popup?.classList.add('hidden');
    }

    acceptBtn?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: true,
        analytics: true,
        marketing: true
      }));
      popup.classList.add('opacity-0');
      setTimeout(() => popup.classList.add('hidden'), 300);
    });

    refuseBtn?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: true,
        analytics: false,
        marketing: false
      }));
      popup.classList.add('opacity-0');
      setTimeout(() => popup.classList.add('hidden'), 300);
    });

    customBtn?.addEventListener('click', () => {
      settingsPanel.classList.remove('hidden');
    });

    saveBtn?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: true,
        analytics: analyticsToggle.checked,
        marketing: marketingToggle.checked
      }));
      popup.classList.add('opacity-0');
      setTimeout(() => popup.classList.add('hidden'), 300);
    });

    LanguageContext().subscribe(this.render.bind(this));
  }

  disconnectedCallback() {
    LanguageContext().unsubscribe(this.render.bind(this));
  }

  render() {
    const lang = LanguageContext().getLang();

    this.innerHTML = `
      ${this.renderCookiePopup(lang)}
    `;
  }

  renderCookiePopup(lang: string) {
    return `
      <div id="cookiePopup" class="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-2xl shadow-xl z-50 transition-opacity duration-300">
        <h2 class="text-lg font-semibold mb-2">${t("cookie_title", lang)}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          ${t("cookie_text", lang)} 
          <a href="/support" class="text-blue-500 hover:underline">${t("cookie_link", lang)}</a>.
        </p>
        <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end">
          <button id="customCookies" class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            ${t("cookie_customize", lang)}
          </button>
          <button id="refuseCookies" class="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm transition">
            ${t("cookie_refuse", lang)}
          </button>
          <button id="acceptCookies" class="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm transition">
            ${t("cookie_accept", lang)}
          </button>
        </div>

        <div id="cookieSettings" class="mt-4 hidden border-t pt-4 dark:border-gray-600">
          <h3 class="text-sm font-semibold mb-2">${t("cookie_settings_title", lang)}</h3>
          <label class="flex items-center justify-between text-sm mb-1">
            <span>${t("cookie_functional", lang)}</span>
            <input type="checkbox" checked disabled class="accent-green-600 cursor-not-allowed" />
          </label>
          <label class="flex items-center justify-between text-sm mb-1">
            <span>${t("cookie_analytics", lang)}</span>
            <input id="analyticsToggle" type="checkbox" class="accent-blue-500" />
          </label>
          <label class="flex items-center justify-between text-sm mb-3">
            <span>${t("cookie_marketing", lang)}</span>
            <input id="marketingToggle" type="checkbox" class="accent-pink-500" />
          </label>
          <div class="flex justify-end">
            <button id="savePreferences" class="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm">
              ${t("cookie_save", lang)}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
