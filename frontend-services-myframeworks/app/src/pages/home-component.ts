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
      <section class="section-container">
        <div class="section-content">
          <h1 class="section-title">Bienvenue sur GameCentral</h1>
          <div class="dashboard-grid">
            ${this.card("Dashboard", "Accédez à votre tableau de bord", "/dashboard", "📊", disable)}
            ${this.card("Jouer", "Lancez une nouvelle partie", "/game", "🎮", disable)}
            ${this.card("Profil", "Gérez vos informations personnelles", "/profile", "👤", disable)}
            ${this.card("Classement", "Consultez le classement général", "/leaderboard", "🏆", disable)}
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
