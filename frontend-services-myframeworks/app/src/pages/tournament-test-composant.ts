import { RoundAccordion } from "./round-Accordion-composant";

export interface Tournaments {
	id: number;
	games?: Game[];
	state?: string;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	rounds?: Round[];
	currentRound?: number;
	winner: User | number | null;
  }
  
  export interface Round {
	id: number;
	games: Game[];
	state: string;
	players?: User[] | number[];
	created_at: Date;
	updated_at: Date;
	tournaments?: Partial<Tournaments>[];
	current: number;
  }
  
  export interface User {
	id: number;
	name: string;
	avatar: string;
	role: string;
	games: Game[] | null;
	tournaments: Tournaments[] | null;
	created_at: string;
	updated_at: string;
  }
  
  export interface GameHistory {
	id: number;
	score1: number;
	player1: number;
	score2: number;
	player2: number;
	created_at: string;
	updated_at: string;
  }
  
  export interface Game {
	id: number;
	difficulty: string;
	state: string;
	gameHistory: GameHistory | null;
	created_at: string;
  }
  
  // --- Composant DashboardTournois ---
export class DashboardTournois extends HTMLElement {
	private tournaments: Tournaments[] = [];
  
	constructor() {
	  super();
	//  this.attachShadow({ mode: 'open' });
	}
  
	set data(tourneys: Tournaments[]) {
	  this.tournaments = tourneys;
	  this.render();
	}
  
	connectedCallback() {
	  this.render();
	}
  
	private render() {	  

	  this.innerHTML = `
		
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6">Tournament History</h2>
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="p-4">
                    <div class="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3">
                    Id
                </th>
                <th scope="col" class="px-6 py-3">
                    state
                </th>
                <th scope="col" class="px-6 py-3">
                    Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Victory
                </th>
            </tr>
        </thead>
        <tbody id="table-tournament-history"">
		
		  ${this.tournaments.map(tournament => `
			<tr data-id="${tournament.id}" class="tournamentRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
		<td class="w-4 p-4">
			<div class="flex items-center">
				<input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
				<label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
			</div>
		</td>
		<td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
			<div class="ps-3">
				<div class="text-base font-semibold">${tournament.id}</div>
			</div>  
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center">
				<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${tournament.state}
			</div>
		</td>
		<td class="px-6 py-4">
			 ${new Date(tournament.created_at).toLocaleDateString()}
			
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center">
			${tournament.winner ? `<span>Gagnant : ${(typeof tournament.winner === 'number') ? 'ID ' + tournament.winner : tournament.winner.name }</span>` : ''}
				
			</div>
		</td>
	</tr>
		  `).join('')}
        </tbody>
    </table>
        </div>

	  `;

	  // Ajouter l'événement de click pour rediriger vers le détail du tournoi
	  this.querySelectorAll('.tournamentRow').forEach(card => {
		//this.shadowRoot.querySelectorAll('.tournamentRow').forEach(card => {
		card.addEventListener('click', (e: Event) => {
		  const target = e.currentTarget as HTMLElement;
		   const id = target.getAttribute('data-id');
		  if (!id) return;		 
		 const tournoi = this.tournaments.find(t => t.id === Number(id));
		 if (!tournoi) return;
		 // Créer un nouvel élément <tr>
		 const newRow = document.createElement('tr');
		 const newRowTd = document.createElement('td');
		 newRowTd.setAttribute('data-type', 'detail');
		 newRowTd.setAttribute('colspan', '5');
		 newRowTd.appendChild(this.showTournamentDetail(tournoi));
		 newRow.appendChild(newRowTd);
		 
		 if (target.parentNode) {
		 // Vérifier si le nouvel élément existe déjà
		const existingRow = target.nextSibling;
		if (existingRow && (existingRow.nodeType === Node.ELEMENT_NODE)) {
		   // Si oui, le supprimer
		   target.parentNode.removeChild(existingRow);
		 }else {
		   // Sinon, ajouter le nouvel élément
		   target.parentNode.insertBefore(newRow, target.nextSibling);
		 }	 
		}});
	  });
	}
	private showTournamentDetail(tournoi: Tournaments) {
		const newRowDetail = document.createElement('tournoi-detail') as any;
		newRowDetail.data = tournoi;
		return newRowDetail;
	  }
  }
  
  
customElements.define('round-accordion', RoundAccordion);
  // --- Composant TournoiDetail ---
export  class TournoiDetail extends HTMLElement {
	private tournoi: Tournaments | null = null;
  
	constructor() {
	  super();
	}
  
	set data(tournoi: Tournaments) {
	  this.tournoi = tournoi;
	  this.render();
	}
  
	connectedCallback() {
	  this.render();
	}
  
	private render() {
	  if (!this.tournoi) {
		this.innerHTML = `<p>Aucun tournoi sélectionné.</p>`;
		return;
	  }
	  this.innerHTML = `
		<style>
		  .rounds-container {
			margin-top: 1rem;
		  }
		</style>
		<div class="mx-auto p-6 text-center w-full">
		  <h2>Détails du Tournoi #${this.tournoi.id}</h2>
		  <p>État: ${this.tournoi.state || 'Inconnu'}</p>
		  <div class="rounds-container">
			${this.tournoi.rounds && this.tournoi.rounds.length > 0 ? 
			  this.tournoi.rounds.map(round => `<round-accordion data='${JSON.stringify(round)}'></round-accordion>`).join('') : 
			  '<p>Aucun round disponible.</p>'}
		  </div>
		</div>
	  `;
  
	}
  }
  
  
  // --- Composant GameCard ---
 export  class GameCard extends HTMLElement {
	private game: Game | null = null;
  
	constructor() {
	  super();
	}
  
	set data(data: string) {
	  try {
		this.game = JSON.parse(data);
	  } catch (error) {
		console.error('Erreur de parsing des données du game', error);
		this.game = null;
	  }
	  this.render();
	}
  
	connectedCallback() {
	  this.render();
	}
  
	private render() {
		if (!this.game)
			{
				const data = this.getAttribute('data');
				if (data) {
					try {
						this.game = JSON.parse(data);
					} catch (error) {
						console.error('Erreur de parsing des données du game', error);
						this.game = null;
					}
				}
			}
	  if ( !this.game) return;
	  const gameHistory = this.game.gameHistory ? `
		<p>Score: ${this.game.gameHistory.score1} - ${this.game.gameHistory.score2}</p>
	  ` : '<p>Aucun historique.</p>';
  
	  this.innerHTML = `
		<style>
		  .game-card {
			border: 1px solid #aaa;
			padding: 0.5rem;
			margin-bottom: 0.5rem;
			border-radius: 4px;
		  }
		</style>
		<div class="game-card">
		  <h4>Jeu #${this.game.id} - Difficulté : ${this.game.difficulty}</h4>
		  ${gameHistory}
		</div>
	  `;
	}
  }
  
  