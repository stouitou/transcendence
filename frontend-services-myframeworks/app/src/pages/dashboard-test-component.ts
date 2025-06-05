import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { User, Tournaments } from "../types/types";
import { DonutsChart } from "./charts-donuts-componenet";
import { GameCardTest } from "./game-card-component";
import { ProfilStatsComponent } from "./profil-stats-component";
import { DashboardTournois, GameCard,  TournoiDetail } from "./tournament-test-composant";

customElements.define('dashboard-tournois', DashboardTournois);

customElements.define('tournoi-detail', TournoiDetail);
customElements.define('game-card-component', GameCardTest);
customElements.define('game-card', GameCard);
customElements.define('donuts-chart',DonutsChart);


  if (!customElements.get('profil-stats-component')) {
	customElements.define('profil-stats-component', ProfilStatsComponent);
  }
export class Dashboard extends BaseComponent<{ user: User | null,tournamentsData: Tournaments[]}> {
	constructor() {
		super({ user: null, tournamentsData: [] });
	  }

  
	connectedCallback() {
		//super.connectedCallback();
		this.state.user = UserContext().user();
		if (this.state.user) {
			this.state.tournamentsData = this.state.user.tournaments || [];
		} else {
		// console.log('No user connected');
		}
		this.render();
		document.addEventListener('profile-data-updated', (e: Event) => {
		const customEvent = e as CustomEvent;
		// console.log('profile-data-updated event received');
		this.state.user = customEvent.detail.profileData;
		/*  if (this.state.user) {
			this.state.tournamentsData = this.state.user.tournaments || [];
		} else {
		console.log('No user connected');
		} */
		this.render();
		});
	}
  
	render() {
	  this.renderDashboard();
	}
  
	private renderDashboard() {
		this.innerHTML = `
		  <div class="min-h-screen w-full px-6 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
			<div class="max-w-7xl mx-auto space-y-10">
			  
			  <!-- Profile & Chat Row -->
			  <div class="flex flex-col md:flex-row gap-6">
				<profile-component class="flex-1"></profile-component>
			  </div>

			  <profil-stats-component id=${this.state.user?.id}></profil-stats-component>
	  
			  <!-- History + Dashboard -->
			  <game-history-component></game-history-component>
			  <dashboard-tournois></dashboard-tournois> 
			</div>
		  </div>
		`;
	}
}