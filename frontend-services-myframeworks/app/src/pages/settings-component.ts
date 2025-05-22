import { BaseComponent } from "../frameworks/base-component";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";

export class Settings extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    super.connectedCallback();
    LanguageContext().subscribe(() => this.render());
    this.render();
  }

  render() {
    const lang = LanguageContext().getLang();

    this.innerHTML = `
      <section class="min-h-screen px-4 py-8 text-gray-900 dark:text-white">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${t("settings", lang)}</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium mb-1" for="theme">${t("them", lang)}</label>
              <select id="theme" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="light">${t("light", lang)}</option>
                <option value="dark">${t("dark", lang)}</option>
                <option value="system">${t("system", lang)}</option>
              </select>
            </div>

            <div>
              <language-component></language-component>
            </div>

            <div class="flex justify-end">
              <button class="bg-gradient-to-br
                 from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg transition">${t("save", lang)}</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
