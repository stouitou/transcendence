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
	  <section class=" px-4 py-8">
		<div class="max-w-7xl mx-auto">
		  <h1 class="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
		  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
