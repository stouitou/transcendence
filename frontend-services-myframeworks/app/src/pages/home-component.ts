import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { User } from '../types/types';

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
            ${this.card("Jouer", "Lancez une nouvelle partie", "/game-loby", "🎮",disable)}
            ${this.card("Profil", "Gérez vos informations personnelles", "/profile", "👤",disable)}
            ${this.card("Classement", "Consultez le classement général", "/leaderboard", "🏆",disable)}
            ${this.card("Paramètres", "Réglez vos préférences", "/settings", "⚙️")}
            ${this.card("Support", "Besoin d’aide ?", "/support", "❓")}
            ${user?.role === 'admin' ? this.card("Admin", "Gérez les utilisateurs et le contenu", "/admin", "👨‍💼") : ''}
          </div>
        </div>
      </section>
    `;
  }

  card (title: string, subtitle: string, link: string, emoji: string, disabled: boolean = false) : string {
    // Si l'utilisateur n'est pas connecté, désactiver le lien et ajouter une classe CSS
    const isDisabled = disabled;
    const linkAttribute = isDisabled ? '' : `href="${link}"`;
    const cardClasses = isDisabled
      ? 'dashboard-card-disabled'
      : 'dashboard-card-hover';
  
    return `
      <a ${linkAttribute} data-link="${link}" class="dashboard-card ${cardClasses}">
        <div class="dashboard-card-icon">${emoji}</div>
        <h2 class="dashboard-card-title">${title}</h2>
        <p class="dashboard-card-text-muted">${subtitle}</p>
      </a>
    `;
  }
}
