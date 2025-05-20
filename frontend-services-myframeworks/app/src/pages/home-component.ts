import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";

export class Home extends BaseComponent<{user: User | null}> {
  constructor() {
    super({user: null});
  }
  handleListenerProfileUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    this.state.user = customEvent.detail.profileData;
    this.render();
  };
  connectedCallback() {
     this.state.user = UserContext().user();
     this.render();
     this.listenCustomEvent("profile-data-updated", this.handleListenerProfileUpdate.bind(this));
   }

  render() {
    const { user } = this.state;
    const disable = user === null || user === undefined;
    this.innerHTML = `
      <section class=" px-4 py-8">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl font-bold mb-8 text-center">Bienvenue sur GameCentral</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${this.card("Dashboard", "Accédez à votre tableau de bord", "/dashboard", "📊",disable)}
            ${this.card("Jouer", "Lancez une nouvelle partie", "/game", "🎮",disable)}
            ${this.card("Profil", "Gérez vos informations personnelles", "/profile", "👤",disable)}
            ${this.card("Classement", "Consultez le classement général", "/leaderboard", "🏆",disable)}
            ${this.card("Paramètres", "Réglez vos préférences", "/settings", "⚙️")}
            ${this.card("Support", "Besoin d’aide ?", "/support", "❓")}
          </div>
        </div>
      </section>
    `;

/*     // Attach event to cards (simulate navigation or hook with your router)
    const cards = this.querySelectorAll('[data-link]');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.link;
        if (target) {
          window.location.href = target; // ou utiliser ton router interne (Le router gere deja les liens via le <a href=...>)
        }
      });
    }); */
  }

  card(title: string, subtitle: string, link: string, emoji: string,disabled:boolean = false): string {
    // Si l'utilisateur n'est pas connecté, désactiver le lien et ajouter une classe CSS
    const isDisabled = disabled;
    const linkAttribute = isDisabled ? '' : `href="${link}"`;
    const cardClasses = isDisabled
      ? 'cursor-not-allowed opacity-50 bg-gray-200 dark:bg-gray-700'
      : 'cursor-pointer bg-white dark:bg-gray-800 hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700';
  
    return `
      <a ${linkAttribute} data-link="${link}" class="p-6 rounded-2xl shadow ${cardClasses}">
        <div class="text-4xl mb-3">${emoji}</div>
        <h2 class="text-xl font-semibold mb-1">${title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">${subtitle}</p>
      </a>
    `;
  }
}
