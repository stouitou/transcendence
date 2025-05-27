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
     <section class=" px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${this.t("SETTINGS.TITLE")}</h1>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium mb-1" for="theme">${this.t("THEME.TITLE")}</label>
              <select id="theme" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="light">${this.t("THEME.LIGHT")}</option>
                <option value="dark">${this.t("THEME.DARK")}</option>
                <option value="system">${this.t("THEME.SYSTEM")}</option>
              </select>
            </div>

            <div>
              <language-component></language-component>
            </div>
        </div>
      </section>
    `;
  }
}
