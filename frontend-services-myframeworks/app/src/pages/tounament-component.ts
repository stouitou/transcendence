import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { Game, User } from "../types/types";

export class	Tournament extends BaseComponent<{ user: User | null; tournaments: Tournament[] | null }> {

	constructor () {
		super({ user: null, tournaments: null });
	}

	connectedCallback () {
		super.connectedCallback();
		this.state.user = UserContext().user();
		this.render();
		document.addEventListener('profile-data-updated', (e: Event) => {
			const	customEvent = e as CustomEvent;
			// console.log('profile-data-updated event received');
			this.state.user = customEvent.detail.profileData;
			this.render();
		});
	}

	setUser (user: User) {
		this.setState({ ...this.state, user });
	}

	render () {
		const	{ user } = this.state;

		if (user) {
			// console.log('game', user.games);
			this.innerHTML = `
				<div class="mx-auto p-6 text-center">
					<h2 class="text-3xl font-bold text-center mb-6 text-gray-800">Game History</h2>
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
									State
								</th>
								<th scope="col" class="px-6 py-3">
									Date
								</th>
								<th scope="col" class="px-6 py-3">
									Victory
								</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
			`;
			const	tbody = document.querySelector('tbody')
			if (tbody) {
				user.games?.forEach((game) =>
					tbody.innerHTML += this.gameDetailsView(game)
				);
			}
			return;
		}
		this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
	}

	gameDetailsView = (game:Game) => {
		/* 	let victory:number|null = null;
		if (game?.gameHistory)
			{
				if ( game?.gameHistory.score1 >	game?.gameHistory.score2 ) victory = game?.gameHistory.player1;
				if ( game?.gameHistory.score2 > game?.gameHistory.score1 ) victory = game?.gameHistory.player2;
				if ( game?.gameHistory.score1 ===	game?.gameHistory.score2 ) victory = null;
			} */
		// console.log('game', game);
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
						<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2">${game.state}</div>
					</div>
				</td>
				<td class="px-6 py-4">
					${new Date(game.created_at).toLocaleDateString()}
				</td>
				<td class="px-6 py-4">
					<div class="flex items-center">
						<div class=${`h-2.5 w-2.5 rounded-full `}></div>
						<span>${game.gameHistory?.winner??''}</span>
					</div>
				</td>
			</tr>
		`);
	}
}
