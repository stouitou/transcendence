// src/components/SettingsLanguage.ts
import { BaseComponent } from "../frameworks/base-component";
import { SettingsFormData } from "../types/forms.type";
import { settingsditLangconstraint } from "../utils/constraints";

export class SettingsLanguage extends BaseComponent<{}, SettingsFormData> {

  constructor() {
    super({});
  }

  attachAllForm() {
    const formHandlerEditName = this.addForm('formUpdateLang');
    formHandlerEditName?.addValidation(settingsditLangconstraint);
    this.attachEvent(this, '#lang', 'change', this.handleLanguageChange.bind(this));
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="p-8 max-w-lg mx-auto">
        <!-- Glass-like container -->
        <form
          id="formUpdateLang"
          class="
            bg-white bg-opacity-20
            dark:bg-gray-800 dark:bg-opacity-20
            backdrop-blur-lg
            rounded-2xl
            shadow-xl
            p-8
            space-y-6
          "
        >
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-4">
            ${this.t("LANGUAGE.CHOOSE")}
          </h2>

          <!-- Error placeholder -->
          <div id="lang-error" class="text-red-500 text-xs"></div>

          <!-- Select input wrapper -->
          <div class="relative">
            <select
              id="lang"
              name="lang"
              class="
                w-full
                appearance-none
                px-5 py-3
                border border-gray-300 dark:border-gray-600
                rounded-xl
                bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-400
                transition
              "
            >
              <option value="fr" ${this.currentLang === 'fr' ? 'selected' : ''}>
                ${this.t("LANGUAGE.FR")}
              </option>
              <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>
                ${this.t("LANGUAGE.EN")}
              </option>
              <option value="es" ${this.currentLang === 'es' ? 'selected' : ''}>
                ${this.t("LANGUAGE.ES")}
              </option>
            </select>
            <!-- Down arrow icon -->
            <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"/>
              </svg>
            </span>
          </div>

          <!-- Message box placeholder -->
          <div id="message-box" class="text-center font-medium text-gray-700 dark:text-gray-200"></div>
        </form>
      </div>
    `;
    this.attachAllForm();
  }

  handleLanguageChange = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formUpdateLang');
    if (!formHandler?.validateForm()) {
      this.showMessage(this.t('FORM.GENERIC.ERROR'), 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      this.setLang(formData.lang);
      this.showMessage(`${this.t('FORM.GENERIC.SUCCESS')} ${formData.lang}`, 'success');
    } catch (error) {
      console.error('SETTING failed:', error);
    }
  }
}
