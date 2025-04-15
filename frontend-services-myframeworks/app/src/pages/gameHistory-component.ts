import { BaseComponent } from "../frameworks/base-component.ts";
import { Game, User, UserContext } from "../globalstate/GlobalState.ts";


export class GameHistory extends BaseComponent<{ user: User | null,
	 localGame: Game[] | null,
	remoteGame: Game[] | null,}> {
  constructor() {
	super({ user: null, localGame: null, remoteGame: null });
  }

  connectedCallback() {
	super.connectedCallback();
	this.state.user = UserContext().user();
	this.setFilteredGames(this.state.user?.games?? null);
	this.render();
	document.addEventListener('profile-data-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('profile-data-updated event received');
	  this.state.user = customEvent.detail.profileData;
	  this.setFilteredGames(this.state.user?.games?? null);
	  this.render();
	});
  }

  setFilteredGames(games: Game[]| null) {
	if (!games) return;
	const localGame = games.filter((game) => game.type === 'local');
	const remoteGame = games.filter((game) => game.type === 'remote');
	this.setState({ ...this.state, localGame, remoteGame });
	  }


  setUser(user: User) {
	this.setState({ ...this.state, user });
  }

  render() {
	const { user , localGame, remoteGame} = this.state;

	if (user) {
		console.log('game', user.games);
	  this.innerHTML = `
		
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Local</h2>
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
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Remote</h2>
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
			 const game = this.state.user?.games?.find(t => t.id === Number(id));
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

		
	  return;
	}
	this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
  }

  gameDetailsView = (game:Game) => {
	let victory:number|null = null;
	if (game?.gameHistory)
		{
			if ( game?.gameHistory.score1 >  game?.gameHistory.score2 ) victory = game?.gameHistory.player1;
			if ( game?.gameHistory.score2 > game?.gameHistory.score1 ) victory = game?.gameHistory.player2;
			if ( game?.gameHistory.score1 ===  game?.gameHistory.score2 ) victory = null;
		}
	console.log('game', game);
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
					<div class=${`h-2.5 w-2.5 rounded-full  ${victory === this.state.user?.id ? 'bg-green-500 ' : ''}`}></div>
					<span>${victory === this.state.user?.id?"ME":victory?`User-${victory}`:"" }</span>
				
			</div>
		</td>
	</tr>
	`);
  }
}

