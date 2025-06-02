import { BaseComponent } from "../frameworks/base-component";

export class Settings extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="max-w-3xl mx-auto mt-12 bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">${this.t("SETTINGS.TITLE")}</h1>
        <div class="space-y-6">
          <div class="space-y-2">
            <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-gray-300">${this.t("THEME.TITLE")}</label>
            <div class="relative">
              <select id="theme" class="w-full appearance-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="light">${this.t("THEME.LIGHT")}</option>
                <option value="dark">${this.t("THEME.DARK")}</option>
                <option value="system">${this.t("THEME.SYSTEM")}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"/>
                </svg>
              </span>
            </div>
          </div>
          <div class="pt-6">
            <language-component></language-component>
          </div>
        </div>
      </section>
    `;
  }
}
