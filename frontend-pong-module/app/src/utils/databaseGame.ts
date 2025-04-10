import { Player } from "../entities/Player";

export async function createGameDatabase (players: Player[], mode: string) : Promise<void> {
	console.log("players: ", players);
	const url = 'https://localhost:4433/api/v2/database/myDb/table/game';
	const body = {
	  players: players,
	  state: 'running',
	  mode: `${mode}`,
	};

	try {
	  const response = await fetch(url, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	  });
	  await response.json();
	}
	catch (error) {
	  console.error("Error creating game in database");
	}
}

export async function updateStateGameDatabase () : Promise<void> {
	const getGames = 'https://localhost:4433/api/v2/database/myDb/table/game';
	
	try {
		const first = await fetch(getGames);
		const games = await first.json();
		for (let i = 0; i < games.data.length; i++) {
			if (games.data[i].state === "running") {
				const url = 'https://localhost:4433/api/v2/database/myDb/table/game/id/' + games.data[i].id;
				const body = {
					state: 'finish',
				}
				const second = await fetch(url, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				});
				await second.json();
			}
		} 
	}
	catch (error) {
	  console.error("Error updating game in database");
	}
}
