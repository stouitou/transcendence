import { BaseComponent } from "../frameworks/base-component.ts";
import { Game, Round, Tournaments, User, UserContext } from "../globalstate/GlobalState.ts";


export class TournamentHistory extends BaseComponent<{ user: User | null}> {
  constructor() {
	super({ user: null });
  }

  connectedCallback() {
	super.connectedCallback();
	this.state.user = UserContext().user();
	this.render();
	document.addEventListener('profile-data-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('profile-data-updated event received');
	  this.state.user = customEvent.detail.profileData;
	  this.render();
	});
  }


  setUser(user: User) {
	this.setState({ ...this.state, user });
  }

  render() {
	const { user } = this.state;

	if (user) {
		console.log('user.tournaments', user.tournaments);
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
		
        </tbody>
    </table>
        </div>
		`;
		const tbody = document.querySelector('#table-tournament-history')
		if (tbody) {
		  user.tournaments?.forEach((tournament) =>
				tbody.innerHTML +=this.tournamentDetailsView(tournament)
		  
		  );
		}
	  return;
	}
	this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
  }

  tournamentDetailsView = (tournament:Tournaments) => {
	let victory:number|null = null;
	if (tournament.winner === this.state.user?.id) victory = this.state.user?.id;
	console.log('tournamentDetailsView', tournament);
	return (`
	<tr class=" border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
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
					<div class=${`h-2.5 w-2.5 rounded-full  ${victory === this.state.user?.id ? 'bg-green-500 ' : ''}`}></div>
					<span>${victory === this.state.user?.id?"ME":`User-${victory}` }</span>
				
			</div>
		</td>
	</tr>
	${tournament.rounds?.map((round:Round) => this.tournamentRoundDetailsView(round)).join('')}
	`);
  }

  tournamentRoundDetailsView = (round:Round) => {
	console.log('tournamentRoundDetailsView', round);
	return (`
	<tr class=" border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
		<td class="w-4 p-4">
			<div class="flex items-center">
				<input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
				<label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
			</div>
		</td>
		<td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
			<div class="ps-3">
				<div class="text-base font-semibold">${round.id}</div>
			</div>  
		</td>
		<td class="px-6 py-4">
				<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${round.current}
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center">
				<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${round.state}
			</div>
		</td>
		<td class="px-6 py-4">
			 ${new Date(round.created_at).toLocaleDateString()}			
		</td>
	</tr>
	${round.games?.map((game:Game) => this.gameDetailsView(game)).join('')}

	`);
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
	<tr class=" border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
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
					<span>${victory === this.state.user?.id?"ME":`User-${victory}` }</span>
				
			</div>
		</td>
	</tr>
	`);
  }
}

