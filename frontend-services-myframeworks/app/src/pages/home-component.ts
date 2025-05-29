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
          <h1 class="section-title">${this.t("MENU.TITLE")}</h1>
          <div class="dashboard-grid">
            ${this.card(`${this.t("DASHBOARD.TITLE")}`, `${this.t("DASHBOARD.ACCESS")}`, "/dashboard", "📊", disable)}
            ${this.card(`${this.t("GAME.TITLE")}`, `${this.t("GAME.PHRASE")}`, "/game", "🎮", disable)}
            ${this.card(`${this.t("PROFILE.TITLE")}`, `${this.t("PROFILE.PHRASE")}`, "/profile", "👤", disable)}
            ${this.card(`${this.t("RANKING.TITLE")}`, `${this.t("RANKING.PHRASE")}`, "/leaderboard", "🏆")}
            ${this.card(`${this.t("SETTINGS.TITLE")}`, `${this.t("SETTINGS.PHRASE")}`, "/settings", "⚙️")}
            ${this.card(`${this.t("SUPPORT.TITLE")}`, `${this.t("SUPPORT.LEGAL_TITLE")}`, "/support", "❓")}
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
