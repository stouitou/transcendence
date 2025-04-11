import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";
import { DonutsChart } from "./charts-donuts-componenet";
import { DashboardTournois, GameCard,  Tournaments, TournoiDetail } from "./tournament-test-composant";

customElements.define('dashboard-tournois', DashboardTournois);

customElements.define('tournoi-detail', TournoiDetail);

customElements.define('game-card', GameCard);
customElements.define('donuts-chart',DonutsChart);
export class MainApp extends BaseComponent<{ user: User | null,tournamentsData: Tournaments[]}> {
	constructor() {
		super({ user: null, tournamentsData: [] });
	  }
  
/* 	quelques données de test
	constructor() {
	  super();
	  this.tournamentsData =   [
		{
		  id: 1,
		  state: "Terminé",
		  created_at: new Date(),
		  updated_at: new Date(),
		  winner: { id: 101, name: "Alice", avatar: "", role: "Joueur", games: null, tournaments: null, created_at: "", updated_at: "" },
		  rounds: [
			{
			  id: 1,
			  state: "Fini",
			  current: 1,
			  created_at: new Date(),
			  updated_at: new Date(),
			  games: [
				{
				  id: 1001,
				  difficulty: "Moyen",
				  state: "Terminé",
				  created_at: "",
				  gameHistory: { id: 5001, score1: 10, player1: 101, score2: 8, player2: 102, created_at: "", updated_at: "" }
				}
			  ]
			}
		  ]
		},
		{
			id: 2,
			state: "Terminé",
			created_at: new Date(),
			updated_at: new Date(),
			winner: { id: 101, name: "Alice", avatar: "", role: "Joueur", games: null, tournaments: null, created_at: "", updated_at: "" },
			rounds: [
			  {
				id: 1,
				state: "Fini",
				current: 0,
				created_at: new Date(),
				updated_at: new Date(),
				games: [
				  {
					id: 1001,
					difficulty: "Moyen",
					state: "Terminé",
					created_at: "",
					gameHistory: { id: 5001, score1: 10, player1: 101, score2: 8, player2: 102, created_at: "", updated_at: "" }
				  }
				]
			  }, {
				id: 2,
				state: "Fini",
				current: 1,
				created_at: new Date(),
				updated_at: new Date(),
				games: [
				  {
					id: 1001,
					difficulty: "Moyen",
					state: "Terminé",
					created_at: "",
					gameHistory: { id: 5001, score1: 10, player1: 101, score2: 8, player2: 102, created_at: "", updated_at: "" }
				  }
				]
			  }
			]
		  }
	  ];
	 // this.attachShadow({ mode: 'open' });
	} */
  
  connectedCallback() {
	super.connectedCallback();
	this.state.user = UserContext().user();
	if (this.state.user) {
		this.state.tournamentsData = this.state.user.tournaments || [];
	} else {
	  console.log('No user connected');
	}
	this.render();
	document.addEventListener('profile-data-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('profile-data-updated event received');
	  this.state.user = customEvent.detail.profileData;
	  if (this.state.user) {
		this.state.tournamentsData = this.state.user.tournaments || [];
	} else {
	  console.log('No user connected');
	}
	  this.render();
	});
  }
  
	render() {
	  this.renderDashboard();
	}
  
	private renderDashboard() {
	  this.innerHTML = `
	  <div class="flex flex-row items-center justify-center">
		<donuts-chart id="gameChart"></donuts-chart>
		<donuts-chart id="tournamentChart"></donuts-chart>
	</div>
		<dashboard-tournois></dashboard-tournois>
	  `;
	  // Transmettre les données au composant dashboard-tournois
	  const dashboard = this.querySelector('dashboard-tournois') as any;
	  dashboard.data = this.state.tournamentsData;

	  const gameChart = this.querySelector('#gameChart') as any;
	  gameChart.data ={
		dataset: [
			{ label: "lose", value: 10, color: "#f87171" }, // Rouge
		{ label: "win", value: 9, color: "#60a5fa" }
		],
		title: "Game Chart",
		legende: [
			{label: "lose", color: "bg-red-500" },
			{label: "win", color: "bg-blue-500" }],
	};

	const tournamentChart = this.querySelector('#tournamentChart') as any;
	tournamentChart.data ={
		dataset: [
			{ label: "lose", value: 10, color: "#f87171" }, // Rouge
		{ label: "win", value: 10, color: "#60a5fa" }
		],
		title: "tournament Chart",
		legende: [
			{label: "lose", color: "bg-red-500" },
			{label: "win", color: "bg-blue-500" }],
	};
	}
  
  }
  
  