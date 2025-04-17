export async function createTournamentDatabase (players: string[]) : Promise<void> {
	// console.log("In createTourmamentDatabase, players of the tournament: ", players);
	const url = 'https://localhost:4433/api/v2/database/myDb/table/tournaments';
	const body = {
		players: players,
		state: 'running',
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

export async function updateStateTournamentDatabase () : Promise<void> {
	const getTournaments = 'https://localhost:4433/api/v2/database/myDb/table/tournaments';
	
	try {
		const first = await fetch(getTournaments);
		const tournaments = await first.json();
		for (let i = 0; i < tournaments.data.length; i++) {
			if (tournaments.data[i].state === "running") {
				const url = 'https://localhost:4433/api/v2/database/myDb/table/tournament/id/' + tournaments.data[i].id;
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
	  console.error("Error updating tournament in database");
	}
}
