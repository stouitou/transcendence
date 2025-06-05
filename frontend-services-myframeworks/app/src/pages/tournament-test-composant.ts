import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { getTournaments, MetaPagination,  } from "../services/api.users.game";
import {User, Game, Players,Tournaments } from "../types/types";
import { RoundAccordion } from "./round-Accordion-composant";

 function determinePageCount(offset:number,pagination: MetaPagination):{ currentPage: number, pageCount: number } {
	const { limit, total } = pagination;
	const pageCount = Math.ceil(total / limit);
	const currentPage = Math.floor(offset / limit) + 1;
	return { currentPage, pageCount };
	
  }
 function  generatePagination(currentPage: number, pageCount: number,type:string): string {
	let paginationHTML = '';
  
	// Bouton "Précédent"
	paginationHTML += `
	  <li  data-page="${currentPage - 1}" data-type="${type}" class="paginator">
		<div class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
		   data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
		  <span class="sr-only">Previous</span>
		  <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
		  </svg>
		</div>
	  </li>
	`;
  
	// Boutons pour chaque page
	for (let i = 1; i <= pageCount; i++) {
	  paginationHTML += `
		<li  data-page="${i}"  data-type="${type}" class="paginator">
		  <div class="flex items-center justify-center px-4 h-10 leading-tight ${
			i === currentPage
			  ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
			  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
		  }" data-page="${i}">
			${i}
		  </div>
		</li>
	  `;
	}
  
	// Bouton "Suivant"
	paginationHTML += `
	  <li  data-page="${currentPage + 1}"  data-type="${type}" class="paginator">
		<div class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
		   data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>
		  <span class="sr-only">Next</span>
		  <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
		  </svg>
		</div>
	  </li>
	`;
  
	return paginationHTML;
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
  
 /*  export interface Game {
	id: number;
	difficulty: string;
	state: string;
	gameHistory: GameHistory | null;
	created_at: string;
	currentRound: number;
  } */
  
  // --- Composant DashboardTournois ---
export class DashboardTournois extends BaseComponent<{ user: User | null,
	localTournaments: Tournaments[] | null,
	remoteTournaments: Tournaments[] | null,
	metaPagination:{localGame: MetaPagination| null, remoteGame: MetaPagination| null} }> {
  constructor() {
	super({ user: null,/* games:null, */ localTournaments: null, remoteTournaments: null,metaPagination:{localGame: null, remoteGame: null} });
  }
  /* extends HTMLElement {
	private tournaments: Tournaments[] = [];
  
	constructor() {
	  super();
	//  this.attachShadow({ mode: 'open' });
	} */
  
/* 	set data(tourneys: Tournaments[]) {
	  this.tournaments = tourneys;
	  this.render();
	} */ 
  
	connectedCallback() {
		this.state.user = UserContext().user();
		getTournaments({limit:10},{type:"remote"}).then((result) => {
			if (!result || !result.success) return;
			const {data:tournaments,meta} = result;
			if (tournaments) {
			
			//this.state.games = {...this.state.games,...games};
		//	this.state.games = games;
			this.state.metaPagination.remoteGame= meta;
			this.state.remoteTournaments = tournaments//.filter((game) => game.type === 'remote');
			//this.state.games = {...this.state.games, ...this.state.remoteGame};
			this.render();
			}
		}).catch((e) =>console.error(e));
		getTournaments({limit:10},{type:"local"}).then((result) => {
			if (!result || !result.success) return;
			const {data:tournaments,meta} = result;
			if (tournaments) {
			
			//this.state.games = {...this.state.games,...games};
		//	this.state.games = games;
			this.state.metaPagination.localGame= meta;
			this.state.localTournaments = tournaments//.filter((game) => game.type === 'local');
			//this.state.games = {...this.state.games, ...this.state.localGame};
			this.render();
			}
		}).catch((e) =>console.error(e));
	  this.render();
	}


  
	render() {	 
		const { user , localTournaments, remoteTournaments,metaPagination} = this.state; 
		if (user) {
			const localPagination = metaPagination.localGame
			? generatePagination(
				determinePageCount(metaPagination.localGame.offset, metaPagination.localGame).currentPage,
				determinePageCount(0, metaPagination.localGame).pageCount,
				"local"
			)
			: '';
	
		const remotePagination = metaPagination.remoteGame
			? generatePagination(
				determinePageCount(metaPagination.remoteGame.offset, metaPagination.remoteGame).currentPage,
				determinePageCount(0, metaPagination.remoteGame).pageCount,
				"remote"
			)
			: '';
	  this.innerHTML = `
		
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6">${this.t("TOURNAMENT.TITLE")} ${this.t("TOURNAMENT.GAME_HT_LOC")} ${this.state.metaPagination.localGame?.total||0}</h2>
			  	<nav aria-label="Page navigation ">
					<ul class="flex items-center -space-x-px h-10 text-base">
						${ localPagination}
					</ul>
				</nav>
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
                    ${this.t("TOURNAMENT.STATE")}
                </th>
                <th scope="col" class="px-6 py-3">
                    ${this.t("TOURNAMENT.DATE")}
                </th>
                <th scope="col" class="px-6 py-3">
                    ${this.t("TOURNAMENT.VICTORY")}
                </th>
            </tr>
        </thead>
        <tbody id="table-tournament-history-local">
		
		  ${localTournaments?.map(tournament => `
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
			${tournament.winner ? `<span>${this.t("GAME.WINNER")} : ${(typeof tournament.winner === 'number') ? 'ID ' + tournament.winner : tournament.winner.display_name }</span>` : ''}
				
			</div>
		</td>
	</tr>
		  `).join('')}
        </tbody>
    </table>
        </div>



				
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6">${this.t("TOURNAMENT.TITLE")} ${this.t("TOURNAMENT.GAME_HT_REM")} ${this.state.metaPagination.remoteGame?.total||0}</h2>
			  	<nav aria-label="Page navigation ">
					<ul class="flex items-center -space-x-px h-10 text-base">
						${ remotePagination}
					</ul>
				</nav>
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
                    ${this.t("TOURNAMENT.STATE")}
                </th>
                <th scope="col" class="px-6 py-3">
                    ${this.t("TOURNAMENT.DATE")}
                </th>
                <th scope="col" class="px-6 py-3">
                    ${this.t("TOURNAMENT.VICTORY")}
                </th>
            </tr>
        </thead>
        <tbody id="table-tournament-history-remote">
		
		  ${remoteTournaments?.map(tournament => `
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
			${tournament.winner ? `<span>${this.t("GAME.WINNER")} : ${(typeof tournament.winner === 'number') ? 'ID ' + tournament.winner : tournament.winner.display_name }</span>` : ''}
				
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
		 const tournoi = this.state.localTournaments?.find(t => t.id === Number(id))|| this.state.remoteTournaments?.find(t => t.id === Number(id));//localTournaments?.find(t => t.id === Number(id));
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


		this.querySelectorAll('.paginator').forEach((button) => {
			button.addEventListener('click', (e: Event) => {
			  e.preventDefault();
			  const target = e.currentTarget as HTMLElement;
			  const page = Number(target.getAttribute('data-page'));
			  const type = target.getAttribute('data-type');
			  if (!page || page < 1) return;
			  if (!type) return;		  
			  // Charger les données pour la page sélectionnée
				getTournaments({limit:10, offset: (page - 1) * 10 },{type:type}).then((result) => {
					if (!result || !result.success) return;
					const {data:tournaments,meta} = result;
					if (tournaments) {
					if (type === 'remote') {
						this.state.metaPagination.remoteGame = meta;
						this.state.remoteTournaments = tournaments;
						}
						if (type === 'local') {
						this.state.metaPagination.localGame = meta;
						this.state.localTournaments = tournaments;
						}
					this.render();
					}
				});
			});
		  });
		}
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
  private groupGamesByRound(games: Game[]): Game[][] {
  const groupedGames = games.reduce((acc, game) => {
    const round = game.currentRound; // Récupérer le numéro du round
    if (!acc[round]) {
      acc[round] = []; // Initialiser un tableau pour ce round s'il n'existe pas
    }
    acc[round].push(game); // Ajouter le jeu au tableau correspondant au round
    return acc;
  }, {} as Record<number, Game[]>); // Utiliser un objet pour regrouper les jeux

  // Convertir l'objet en tableau de tableaux
  return Object.values(groupedGames);
}
	private render() {
	  if (!this.tournoi) {
		this.innerHTML = `<p>Aucun tournoi sélectionné.</p>`;
		return;
	  }
	  //grouper par round
	  const groupedGames = this.groupGamesByRound(this.tournoi.games || []);
	   // Construire le contenu de l'accordion
  const accordionContent = groupedGames.map((roundGames, index) => `
    <round-accordion data='${JSON.stringify(roundGames)}' round='${index}'></round-accordion>
  `).join('');
	  this.innerHTML = `
		<div class="mx-auto p-6 text-center w-full">
		  <h2>Détails du Tournoi #${this.tournoi.id}</h2>
		  <p>État: ${this.tournoi.state || 'Inconnu'}</p>
      <div class="mt-4">
        ${accordionContent || '<p>Aucun round disponible.</p>'}
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
	  const gameHistory = this.game.gameHistory || null;
	  const gameHistoryPlayers = gameHistory ? gameHistory.players : null;

  
	  this.innerHTML = `
		<div class="border border-gray-400 p-2 mb-2 rounded">
		  <h4>Jeu #${this.game.id} - Difficulté : ${this.game.difficulty}</h4>
		  <p>État: ${this.game.state}</p>
		  <p>Date de création: ${new Date(this.game.created_at).toLocaleDateString()}</p>
		  <p>Historique du jeu:</p>
		  ${gameHistoryPlayers ? gameHistoryPlayers.map((player: Players,index) => `
			<p>Joueur ${index + 1}: ${player.display_name} score: ${player.score}</p>
		  `).join('') : ''}
		  <p>winner: ${this.game.gameHistory?.winner}</p>
		</div>
	  `;
	}
  }
  
  