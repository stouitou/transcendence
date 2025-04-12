import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from "../globalstate/GlobalState";
import { DonutsChart } from "./charts-donuts-componenet";
import { DashboardTournois, GameCard,  Tournaments, TournoiDetail } from "./tournament-test-composant";

customElements.define('dashboard-tournois', DashboardTournois);

customElements.define('tournoi-detail', TournoiDetail);

customElements.define('game-card', GameCard);
customElements.define('donuts-chart',DonutsChart);
export class Dashboard extends BaseComponent<{ user: User | null,tournamentsData: Tournaments[]}> {
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
	  <div class="mx-auto p-6 text-center">
		<div class="flex flex-row space-x-4">
			<profile-component></profile-component>
			<chat-component></chat-component>
		</div>
		<h2 class="text-2xl font-bold my-2">Game Stats</h2>
		<div class="flex flex-row items-center justify-center bg-white rounded-lg shadow-md dark:bg-gray-800">
			<donuts-chart id="gameChart"></donuts-chart>
			<donuts-chart id="gameChartLocal"></donuts-chart>
			<donuts-chart id="gameChartRemote"></donuts-chart>
		</div>
		<h2 class="text-2xl font-bold my-4">Tournament Stats</h2>
		<div class="flex flex-row items-center justify-center bg-white rounded-lg shadow-md dark:bg-gray-800">
			<donuts-chart id="tournamentChart"></donuts-chart>
			<donuts-chart id="tournamentChartLocal"></donuts-chart>
			<donuts-chart id="tournamentChartRemote"></donuts-chart>
		</div>
			<game-history-component></game-history-component>
			<dashboard-tournois></dashboard-tournois>
	  </div>
	  `;
	 
	// recuperer les stats de l'utilisateur
	const userStats = this.createDataSet(); 
	  // Transmettre les données au composant dashboard-tournois
	   const dashboard = this.querySelector('dashboard-tournois') as any;
	  dashboard.data = this.state.tournamentsData;

	  const gameChart = this.querySelector('#gameChart') as any;
	  gameChart.data = userStats.gamePlayedTotalData;
	  const gameChartLocal = this.querySelector('#gameChartLocal') as any;
	  gameChartLocal.data = userStats.gamePlayedLocalData;
	  console.log('gameChartLocal',  userStats.gamePlayedLocalData);
	  const gameChartRemote = this.querySelector('#gameChartRemote') as any;
	  gameChartRemote.data = userStats.gamePlayedRemoteData;

	  const tournamentChart = this.querySelector('#tournamentChart') as any;
	  tournamentChart.data = userStats.gamePlayedTournamentData;
	  const gameChartTournamentLocal = this.querySelector('#tournamentChartLocal') as any;
	  gameChartTournamentLocal.data = userStats.gamePlayedTournamentLocalData;
	  const gameChartTournamentRemote = this.querySelector('#tournamentChartRemote') as any;
	  gameChartTournamentRemote.data = userStats.gamePlayedTournamentRemoteData;


	}

	createDataSet() {
		// Données reelles
		//game_played
		//recuperer les stats de l'utilisateur
		const userStats = this.state.user?.userStats;
		//cree un objet manipulable pour chaque type de jeu
		const gamePlayedTotal = {
			total: userStats?.total_game_played || 0,
			win: userStats?.total_game_won || 0,
			lose: userStats?.total_game_lost || 0,
			draw: userStats?.total_game_draw || 0,
		}
		const gamePlayedLocal = {
			total: userStats?.local_game_played || 0,
			win: userStats?.local_game_won || 0,
			lose: userStats?.local_game_lost || 0,
			draw: userStats?.local_game_draw || 0,
		}
		const gamePlayedRemote = {
			total: userStats?.remote_game_played || 0,
			win: userStats?.remote_game_won || 0,
			lose: userStats?.remote_game_lost || 0,
			draw: userStats?.remote_game_draw || 0,
		}
		const gamePlayedTournament = {
			total: userStats?.tournament_game_played || 0,
			win: userStats?.tournament_game_won || 0,
			lose: userStats?.tournament_game_lost || 0,
			draw: userStats?.tournament_game_draw || 0,
		}
		const gamePlayedTournamentLocal = {
			total: userStats?.tournament_local_game_played || 0,
			win: userStats?.tournament_local_game_won || 0,
			lose: userStats?.tournament_local_game_lost || 0,
			draw: userStats?.tournament_local_game_draw || 0,
		}
		const gamePlayedTournamentRemote = {
			total: userStats?.tournament_remote_game_played || 0,
			win: userStats?.tournament_remote_game_won || 0,
			lose: userStats?.tournament_remote_game_lost || 0,
			draw: userStats?.tournament_remote_game_draw || 0,
		}

		// creation des objet Data pour les charts
		const gamePlayedTotalData = {
			title: "Game Played Total",
			dataset:[
				{ label: "lose", value: gamePlayedTotal.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedTotal.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedTotal.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]			
		}
		const gamePlayedLocalData = {
			title: "Game Played Local",
			dataset:[
				{ label: "lose", value: gamePlayedLocal.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedLocal.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedLocal.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]			
		}
		const gamePlayedRemoteData = {
			title: "Game Played Remote",
			dataset:[
				{ label: "lose", value: gamePlayedRemote.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedRemote.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedRemote.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]
		}
		const gamePlayedTournamentData = {
			title: "Game Played Tournament",
			dataset:[
				{ label: "lose", value: gamePlayedTournament.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedTournament.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedTournament.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]
		}
		const gamePlayedTournamentLocalData = {
			title: "Game Played Tournament Local",
			dataset:[
				{ label: "lose", value: gamePlayedTournamentLocal.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedTournamentLocal.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedTournamentLocal.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]
		}
		const gamePlayedTournamentRemoteData = {
			title: "Game Played Tournament Remote",
			dataset:[
				{ label: "lose", value: gamePlayedTournamentRemote.lose, color: "#f87171" }, // Rouge
				{ label: "win", value: gamePlayedTournamentRemote.win, color: "#60a5fa" },
				{ label: "draw", value: gamePlayedTournamentRemote.draw, color: "#fbbf24" }
			],
			legende: [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]
		}

		return {
			gamePlayedTotalData,
			gamePlayedLocalData,
			gamePlayedRemoteData,
			gamePlayedTournamentData,
			gamePlayedTournamentLocalData,
			gamePlayedTournamentRemoteData
		}
	}
  
  }
  
  