import { BaseComponent } from "../frameworks/base-component";

export class ProfilePage extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class=" px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Mon Profil</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="flex items-center space-x-4">
              <img src="https://localhost:4433/uploads/1-avatartest.jpg" alt="Avatar" class="w-16 h-16 rounded-full object-cover">
              <div>
                <h2 class="text-lg font-semibold">Bonnie Green</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">name@flowbite.com</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" for="name">Nom</label>
              <input id="name" type="text" value="Bonnie Green" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" for="email">Email</label>
              <input id="email" type="email" value="name@flowbite.com" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
            </div>

            <div class="flex justify-end">
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Mettre à jour</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
