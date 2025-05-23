import { BaseComponent } from "../frameworks/base-component";
import { getProfileStat } from "../services/api.profile";
import { UserStats } from "../types/types";

  export class ProfilStatsComponent extends BaseComponent<{ id: number,userStats:UserStats | null,toggle: boolean}> {
 static get observedAttributes() { return ['id']; }
 private legende = [
				{label: "lose", color: "bg-red-500" },
				{label: "win", color: "bg-blue-500" },
				{label: "draw", color: "bg-yellow-500" }
			]

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'id' && newValue !== oldValue) {
      this.state.id = Number(newValue);
      this.connectedCallback(); // ou une méthode pour recharger les stats
    }
  }
	
	constructor() {
		super({ id: -1 ,userStats: null,toggle: false});
	  }
	connectedCallback() {
		this.render();
		this.state.id = this.state.id === -1? Number(this.getAttribute('id')): this.state.id;
		if (this.state.id === -1 || Number.isNaN(this.state.id)) {
			console.error('No id provided or invalid id');
			return;
		}

		getProfileStat(this.state.id).then((data) => {
			if (data) {
				console.log('Profile stats:', data);
				this.state.userStats = data;
				this.render();
			} else {
				console.log('No user connected');
			}
		}).catch((error) => {
			console.error('Error fetching profile stats:', error);
		});
	}

	setToggle() {
		this.state.toggle = !this.state.toggle;
		this.render();
	}


	render() {
		const {toggle} = this.state;
		this.innerHTML = `
		 ${!toggle ? `
			<divclass=" w-full px-6 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
				<section   id="toggle-profile-charts"  >
					<h2  class="text-2xl font-bold mb-4 text-center">View Profile Stats</h2>
				</section>
			</div>` : `
		  <div class="min-h-screen w-full px-6 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
		  	<div class="max-w-7xl mx-auto space-y-10">
				<section  id="toggle-profile-charts"  >
					<h2  class="text-2xl font-bold mb-4 text-center">Mask Profile Stats</h2>
				</section>
			  <!-- Game Stats Section -->
			  <section>
					<h2 class="text-2xl font-bold mb-4 text-center">Game Stats</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
					<donuts-chart id="gameChart"></donuts-chart>
					<donuts-chart id="gameChartLocal"></donuts-chart>
					<donuts-chart id="gameChartRemote"></donuts-chart>
					</div>
					<div class="flex justify-center mt-2">
						<span class="text-sm text-gray-600 dark:text-gray-400">légende :</span>
						${this.legende.map((item) => `
						<div class="flex items-center mr-4">
							<div class="w-4 h-4 ${item.color} rounded-full mr-2"></div>
							<span class="text-sm text-gray-800 dark:text-white">${item.label}</span>
						</div>`).join('')}
					</div>
			  </section>
	  
			  <!-- Tournament Stats Section -->
			  <section>
				<h2 class="text-2xl font-bold mb-4 text-center">Tournament Stats</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
				  <donuts-chart id="tournamentChart"></donuts-chart>
				  <donuts-chart id="tournamentChartLocal"></donuts-chart>
				  <donuts-chart id="tournamentChartRemote"></donuts-chart>
				</div>
			  </section>
			</div>
		  </div>`}
		`;
		this.attachEvent(this, '#toggle-profile-charts', 'click', this.setToggle.bind(this));
		
		// Appel de la fonction pour créer les jeux de données
		if (!this.state.toggle) return;
	  
 		const userStats = this.createDataSet();
	  
		const gameChart = this.querySelector('#gameChart') as any;
		gameChart.data = userStats.gamePlayedTotalData;
	  
		const gameChartLocal = this.querySelector('#gameChartLocal') as any;
		gameChartLocal.data = userStats.gamePlayedLocalData;
	  
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
		const userStats = this.state.userStats;
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