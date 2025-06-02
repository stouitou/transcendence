import { BaseComponent } from "../../frameworks/base-component";
import { UserContext } from "../../globalstate/GlobalState";
import { User } from '../../types/types';

export class Admin extends BaseComponent<{user: User | null}> {
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
	if (user != null && user.role != 'admin') {
		// Redirige vers la page unAuthorized
		this.router.navigate('/401');
		return;
	}
	const disable = user === null || user === undefined;
	this.innerHTML = `
	  <section class="section-container">
		<div class="section-content">
		  <h1 class="title-main">Admin Dashboard</h1>
		  <div class="dashboard-grid">
			${this.card("manage Users", "Lancez une nouvelle partie", "/admin/users", "👤👤",disable)}
			${this.card("Paramètres", "Réglez vos préférences", "/settings", "⚙️")}
			${this.card("Support", "Besoin d’aide ?", "/support", "❓")}
		  </div>
		</div>
	  </section>
	`;


  }

  card(title: string, subtitle: string, link: string, emoji: string,disabled:boolean = false): string {
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
