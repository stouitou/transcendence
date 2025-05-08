import { BaseComponent } from "../frameworks/base-component";
import { Game, User, UserContext } from "../globalstate/GlobalState";
import { getGames, MetaPagination } from "../services/api";


export class GameHistory extends BaseComponent<{ user: User | null,
	//games: Game[] | null,
	localGame: Game[] | null,
	remoteGame: Game[] | null,
	metaPagination:{localGame: MetaPagination| null, remoteGame: MetaPagination| null} }> {
  constructor() {
	super({ user: null,/* games:null, */ localGame: null, remoteGame: null,metaPagination:{localGame: null, remoteGame: null} });
  }

  connectedCallback() {
	//super.connectedCallback();
	this.state.user = UserContext().user();
	getGames({limit:10},{type:"remote"}).then((data) => {
		if (!data) return;
		const {games,meta} = data;
		console.log('getGames(remote).then((data) games', games);
	  if (games) {
		
		//this.state.games = {...this.state.games,...games};
	//	this.state.games = games;
		this.state.metaPagination.remoteGame= meta;
		this.state.remoteGame = games//.filter((game) => game.type === 'remote');
		//this.state.games = {...this.state.games, ...this.state.remoteGame};
		this.render();
		}
	}).catch((e) =>console.error(e));
	getGames({limit:10},{type:"local"}).then((data) => {
		if (!data) return;
		const {games,meta} = data;
		console.log('getGames(local).then((data) games', games);
	  if (games) {
		//this.state.games = {...this.state.games,...games};
		//this.state.games = games;
		this.state.metaPagination.localGame = meta;
		this.state.localGame = games//.filter((game) => game.type === 'local');
		this.render();
		}
	}).catch((e) =>console.error(e));
	//console.log('localGame', this.state.localGame);
	//this.setFilteredGames(this.state.user?.games?? null);
	this.render();
	/* document.addEventListener('profile-data-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('profile-data-updated event received');
	  this.state.user = customEvent.detail.profileData;
	  this.setFilteredGames(this.state.user?.games?? null);
	  this.render();
	}); */
  }



  setUser(user: User) {
	this.setState({ ...this.state, user });
  }

  determinePageCount(offset:number,pagination: MetaPagination):{ currentPage: number, pageCount: number } {
	const { limit, total } = pagination;
	const pageCount = Math.ceil(total / limit);
	const currentPage = Math.floor(offset / limit) + 1;
	return { currentPage, pageCount };
	
  }
  generatePagination(currentPage: number, pageCount: number,type:string): string {
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
  render() {
	const { user , localGame, remoteGame,metaPagination} = this.state;

	if (user) {
		console.log('game', user.games);
		const localPagination = metaPagination.localGame
		? this.generatePagination(
			this.determinePageCount(metaPagination.localGame.offset, metaPagination.localGame).currentPage,
			this.determinePageCount(0, metaPagination.localGame).pageCount,
			"local"
		  )
		: '';
  
	  const remotePagination = metaPagination.remoteGame
		? this.generatePagination(
			this.determinePageCount(metaPagination.remoteGame.offset, metaPagination.remoteGame).currentPage,
			this.determinePageCount(0, metaPagination.remoteGame).pageCount,
			"remote"
		  )
		: '';
	  this.innerHTML = `
		
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Local ${this.state.metaPagination.localGame?.total||0}</h2>
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
                    Difficulty
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
        <tbody id="table-game-history-local"></tbody>
    </table>
        </div>


		        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Remote ${this.state.metaPagination.remoteGame?.total||0}</h2>
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
                    Difficulty
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
        <tbody id="table-game-history-remote"></tbody>
    </table>
        </div>
		`;
		const tbodyLocal = document.querySelector('#table-game-history-local')
		if (tbodyLocal) {
		  localGame?.forEach((game) =>
			tbodyLocal.innerHTML +=this.gameDetailsView(game)
		  
		  );
		}
		
		const tbodyRemote = document.querySelector('#table-game-history-remote')
		if (tbodyRemote) {
		  remoteGame?.forEach((game) =>
			tbodyRemote.innerHTML +=this.gameDetailsView(game)
		  
		  );
		}

		  // Ajouter l'événement de click pour rediriger vers le détail du tournoi
		  this.querySelectorAll('.gameRow').forEach(card => {
			//this.shadowRoot.querySelectorAll('.tournamentRow').forEach(card => {
			card.addEventListener('click', (e: Event) => {
			  const target = e.currentTarget as HTMLElement;
			   const id = target.getAttribute('data-id');
			  if (!id) return;		 
			 const game = this.state.localGame?.find(t => t.id === Number(id))|| this.state.remoteGame?.find(t => t.id === Number(id));
			 if (!game) return;
			 // Créer un nouvel élément <tr>
			 const newRow = document.createElement('tr');
			 const newRowTd = document.createElement('td');
			 newRowTd.setAttribute('data-type', 'detail');
			 newRowTd.setAttribute('colspan', '5');

			 const newRowTdContent = document.createElement('game-card-component') as any;;
			 newRowTdContent.data = game
			 newRowTd.appendChild(newRowTdContent);
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
			  console.log('paginator click');
			  const target = e.currentTarget as HTMLElement;
			  const page = Number(target.getAttribute('data-page'));
			  const type = target.getAttribute('data-type');
			  console.log('page', page);
			  if (!page || page < 1) return;
			  if (!type) return;		  
			  // Charger les données pour la page sélectionnée
			  getGames({ limit: 10, offset: (page - 1) * 10 }, { type: type }).then((data) => {
				if (!data) return;
				const { games, meta } = data;
				if (type === 'remote') {
				  this.state.metaPagination.remoteGame = meta;
				  this.state.remoteGame = games;
				}
				if (type === 'local') {
				  this.state.metaPagination.localGame = meta;
				  this.state.localGame = games;
				}
				this.render();
			  });
			});
		  });
	  return;
	}
	this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
  }

  gameDetailsView = (game:Game) => {
	console.log('gameDetailsView', game);
	return (`
	<tr data-id="${game.id}" class="gameRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
		<td class="w-4 p-4">
			<div class="flex items-center">
				<input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
				<label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
			</div>
		</td>
		<td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
			<div class="ps-3">
				<div class="text-base font-semibold">${game.id}</div>
			</div>  
		</td>
		<td class="px-6 py-4">
			${game.difficulty}
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center">
				<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${game.state}
			</div>
		</td>
		<td class="px-6 py-4">
			 ${new Date(game.created_at).toLocaleDateString()}
			
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center">
					<div class="h-2.5 w-2.5 rounded-full  bg-green-500"></div>
					<span>${game.gameHistory?.winner??""}</span>
				
			</div>
		</td>
	</tr>
	`);
  }
}

