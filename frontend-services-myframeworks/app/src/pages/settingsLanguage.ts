// src/components/SettingsLanguage.ts
import { BaseComponent } from "../frameworks/base-component";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";

export class SettingsLanguage extends BaseComponent<{ lang: string }> {
  unsubscribe: () => void = () => {};

  constructor() {
    const lang = LanguageContext().getLang();
    super({ lang });
  }

  connectedCallback() {
    this.unsubscribe = LanguageContext().subscribe(() => {
      this.setState({ lang: LanguageContext().getLang() });
    });
    this.render();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  handleLanguageChange = (e: Event) => {
    const lang = (e.target as HTMLSelectElement).value;
    LanguageContext().setLang(lang);
  };

  handleLangChange = (e: Event) => {
    const newLang = (e.target as HTMLSelectElement).value as 'fr' | 'en' | 'es';
    LanguageContext().setLang(newLang);
  }

  render() {
    const currentLang = LanguageContext().getLang();

    this.innerHTML = `
      <div class="p-4">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          ${t("choose_language", currentLang)}
        </label>
        <select id="lang-select" class="rounded px-3 py-2 border dark:bg-gray-800 dark:text-white">
          <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>Français</option>
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
          <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
        </select>
      </div>
    `;

    const select = this.querySelector("#lang-select");
    if (select) {
      select.addEventListener("change", this.handleLangChange);
    }
  }
}
