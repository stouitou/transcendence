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
      <section class="min-h-screen px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Paramètres</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium mb-1" for="theme">Thème</label>
              <select id="theme" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="system">Système</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" for="language">Langue</label>
              <select id="language" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="flex justify-end">
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Enregistrer</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
