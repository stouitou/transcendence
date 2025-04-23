import { BaseComponent } from "../frameworks/base-component";

export class Home extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="min-h-screen px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl font-bold mb-8 text-center">Bienvenue sur GameCentral</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${this.card("Dashboard", "Accédez à votre tableau de bord", "/dashboard", "📊")}
            ${this.card("Jouer", "Lancez une nouvelle partie", "/game", "🎮")}
            ${this.card("Profil", "Gérez vos informations personnelles", "/profile", "👤")}
            ${this.card("Classement", "Consultez le classement général", "/leaderboard", "🏆")}
            ${this.card("Paramètres", "Réglez vos préférences", "/settings", "⚙️")}
            ${this.card("Support", "Besoin d’aide ?", "/support", "❓")}
          </div>
        </div>
      </section>
    `;

    // Attach event to cards (simulate navigation or hook with your router)
    const cards = this.querySelectorAll('[data-link]');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.link;
        if (target) {
          window.location.href = target; // ou utiliser ton router interne
        }
      });
    });
  }

  card(title: string, subtitle: string, link: string, emoji: string) {
    return `
      <div data-link="${link}" class="cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
        <div class="text-4xl mb-3">${emoji}</div>
        <h2 class="text-xl font-semibold mb-1">${title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">${subtitle}</p>
      </div>
    `;
  }
}
