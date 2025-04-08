import { Player } from "./Player.js";
import { Match } from "./Match.js";

export class Tournament {

	private readonly	_container: HTMLDivElement;

	private readonly	_players: Player[];

	private				_round: Player[] = [];
	private				_groups: Map<number, Player[] | null> = new Map();
	private				_chart: HTMLDivElement = document.createElement('div');

	/* CONSTRUCTOR */
	public constructor(players: Player[], container: HTMLDivElement) {
		this._container = container;
		this._players = players;
		if (this._players.length % 2 != 0) {
			this._players.push(new Player('Bot', 0, true));
		}

		this._container.style.height = '100%';
		this._chart.style.position = 'absolute';
		this._chart.style.width = '100%';
		this._chart.style.height = '100%';
		this._chart.style.display = 'grid';
		this._chart.style.gridTemplateColumns = `${this._container.offsetWidth}px`;
		this._chart.style.placeItems = 'center';
		this._chart.style.justifyContent = 'center';
		this._chart.style.font = 'system-ui';
		this._chart.style.color = 'rgb(255, 0, 0)';
		this._chart.style.fontSize = '50px';
		this._chart.style.fontWeight = 'bold';
		this._chart.style.textAlign = 'center';
		this._chart.style.top = '0';
		this._chart.style.left = '0';
		this._chart.innerHTML = "Tournament<br>";
		this._container.appendChild(this._chart);

		this.randomize();
		
		this.createMatch();
		this._container.style.gridTemplateRows = `${this._round.length / 2}fr`;

		this.launchGame(Math.round(this._round.length / 2));
	}

	private randomize () {
		let	array = this._players;
		let	len = array.length;
		while (array.length) {
			let	index = Math.floor(Math.random() * len);
			this._round.push(array.splice(index, 1)[0]);
			len--;
		}
	}

	private createMatch () {
		let	index = 0;
		if (this._round.length % 2 != 0 && this._round.length > 1)
			this._round.push(new Player('Bot', 0, true));
		for (let i = 0; i < this._round.length; i++) {
			if (!this._groups.has(index)) {
				this._groups.set(index, [this._round[i]]);
				this._round[i].location = 0;
			}
			else if (this._groups.get(index)?.length === 1) {
				this._groups.get(index)?.push(this._round[i]);
				this._round[i].location = 1;
				index++;
			}
		}
	}

	private async launchGame (nofMatch: number) {
		await this.showRound();

		this._round.length = 0;
		let i: number = 0;
		let	j = 0;

		while (i < nofMatch) {
			const game = this._groups.get(i);
			if (game) {
				const match: Match = new Match(game, this._container);
				await match.launch();
				if (match.winner && !match.winner.bot) {
					this._round[j] = game[0].lastWin ? game[0] : game[1];
					j++;
				}
			}
			i++;
		}

		this._groups.clear();
		if (this._round.length === 1)
			return ;
		this.createMatch();
		this.launchGame(Math.round(this._round.length / 2));
	}

	private showRound () : Promise<void>
    {
        return new Promise((resolve) => {
			const	nbOfColumns = getComputedStyle(this._chart).gridTemplateColumns.split(' ').length;
	
			for (let i = 0; i < this._round.length / 2; i++) {
				setTimeout(() => {
					const	game = this._groups.get(i);
					if (game) {
						this.showMatch(game, nbOfColumns, i + 1);
					}
				}, i * 800);
			}
			
			document.addEventListener('keydown', (event) => {
				if (event.key === "Enter") {
					this._chart.style.display = 'none';
					const	nbOfColumns = [...getComputedStyle(this._chart).gridTemplateColumns.split(' '), '1fr'].join(' ');
					// this._chart.style.gridTemplateColumns = `${nbOfColumns}`;
					const	columnSize = this._container.offsetWidth / (nbOfColumns.split(' ').length);
					this._chart.style.gridTemplateColumns = `${columnSize}px`;
					for (let i = 0; i < nbOfColumns.split(' ').length - 1; i++) {
						this._chart.style.gridTemplateColumns += ` ${columnSize}px`;
					}
					console.log('in add event listener, gridTemplateColumn = ', this._chart.style.gridTemplateColumns);
					resolve();
				}
			});
        });
	}

	private showMatch (game: Player[], column: number, row: number) {
		this._chart.style.display = 'block';

		const match = document.createElement('div');
		const player1 = document.createElement('div');
		const player2 = document.createElement('div');

		match.style.position = 'relative';
		match.style.width = '200px';
		match.style.height = 'auto';
		match.style.gridColumn = `${column}`;
		match.style.gridRow = `${row}`;
		match.style.margin = '20px auto';
		match.style.font = 'system-ui';
		match.style.color = 'rgb(255, 0, 0)';
		match.style.fontSize = '20px';
		match.style.fontWeight = 'bold';
		match.style.textAlign = 'center';

		player1.style.position = 'relative';
		player1.style.width = '100%';
		player1.style.height = '50%';
		player1.style.margin = '2px';
		player1.style.padding = '5px';
		player1.style.top = '0';
		player1.style.left = '0';
		player1.style.backgroundColor = 'rgb(0, 0, 0)';
		player1.style.clipPath = 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)';
		player1.textContent = `${game[0].name}`;

		player2.style.position = 'relative';
		player2.style.width = '100%';
		player2.style.height = '50%';
		player2.style.margin = '5px';
		player2.style.padding = '5px';
		player2.style.top = '0';
		player2.style.left = '0';
		player2.style.backgroundColor = 'rgb(0, 0, 0)';
		player2.style.clipPath = 'polygon(0% 50%, 10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%)';
		player2.textContent = `${game[1].name}`;

		match.appendChild(player1);
		match.appendChild(player2);
		this._chart.appendChild(match);
	}
}