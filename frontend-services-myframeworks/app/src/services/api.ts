import { Game } from "../globalstate/GlobalState";

/**
 * getGames function to fetch the list of games from the server.
 * It uses the Fetch API to make a GET request to the specified endpoint.
 * If the request is successful, it returns the list of games as a JSON object.
 * If the request fails, it logs an error message to the console.
 * @returns {Promise<void>}
 * 
 */
type Pagination = {
	limit?: number;
	offset?: number;
	order?: 'ASC' | 'DESC';
}
type Filter = {
	type?: string;
}
export type MetaPagination = { limit: number, offset: number, order: 'ASC'|'DESC',total: number }
export const getGames = async (pagination:Pagination,filter:Filter): Promise<{games:Game[],meta:MetaPagination} | void> => {
	//limit: 10, offset: 2, order: 'ASC'
	const { limit = 10, offset = 0, order = 'ASC' } = pagination;
	const { type ="remote" } = filter;
	try {
		const response = await fetch(`/api/game-management-service/games/pagination?limit=${limit}&offset=${offset}&order=${order}&filters={"type":"${type}","format":"classic"}&relations=tournament`);///games/pagination?limit=10&offset=2
		if (response.ok) {
			const {data, meta} = await response.json();
        console.log('games list:', data);
        return {games:data,meta};
		} else {
			console.log ('[debug] Failed to fetch games list');
			return {games:[],meta:{limit:0,offset:0,order:'ASC',total:0}};
		}
	} catch (error) {
		console.error('Error fetching games data:', error);
	}
};

interface CreateGamesData {
	players: number[];
	mode?: string;
	difficulty?: number;
	}

/**
 * CreateGames function to create a new game on the server.
 * It uses the Fetch API to make a POST request to the specified endpoint.
 * The request body contains the game data in JSON format.
 * If the request is successful, it returns the created game as a JSON object.
 * If the request fails, it throws an error.
 * @param data - The game data to be sent in the request body.
 * @param data.players - An array of player IDs.
 * @param data.mode - The game mode (optional).
 * @param data.difficulty - The game difficulty (optional). 
 * @returns 
 */
export const CreateGames = async (data: CreateGamesData): Promise<Game|void> => {
	const response = await fetch('/api/game-management-service/games', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error('Failed to register');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('CreateGames successful:', result);
	return result;
};

/**
 * getGameById function to fetch a specific game by its ID from the server.
 * @param id - The ID of the game to be fetched.
 * It uses the Fetch API to make a GET request to the specified endpoint.
 * If the request is successful, it returns the game data as a JSON object.
 * If the request fails, it logs an error message to the console.
 * @param id - The ID of the game to be fetched.
 * @returns 
 */
export const getGameById = async (id:number): Promise<Game | void> => {

	try {
		const response = await fetch(`/api/game-management-service/games/${id}`);
		if (response.ok) {
			const game = await response.json();
        console.log('game:', game);
        return game;
		} else {
			throw ('[debug] Failed to fetch game by id');
		}
	} catch (error) {
		console.error('Error fetching game by id data:', error);
	}
};

interface GameHistoryData {
	player1: number;
	player2: number;
	score1: number;
	score2: number;
	created_at: string;
	game: {id:number,state?:string};
}
export const createGameHistory = async (data: GameHistoryData): Promise<Game | void> => {
	const response = await fetch(`api/game-management-service/gameHistory`, {
	//const response = await fetch(`/api/game-management-service/games/${gameId}/gameHistory`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error('Failed to createGameHistory');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('createGameHistory successful:', result);
	return result;
}

export interface User {id: number;
	name?: string;
	avatar?: string;
	password?: string;
	created_at: Date;
	updated_at: Date;
	role: string;
	level?: number;
	tournaments?: Tournaments[];
	games?: Game[];
}
export interface Tournaments {
	id: number;
	games?: Game[];
	state?: string;
	players?: User[];
	created_at: Date;
	updated_at: Date;
	rounds?: Round[];
	currentRound?: number;
	winner?: User | number;
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

//Tournament 
export const getTournaments = async (): Promise<Tournaments[] | void> => {
	try {
		const response = await fetch(`/api/game-management-service/tournaments`);
		if (response.ok) {
			const tournaments = await response.json();
		console.log('tournaments list:', tournaments);
		return tournaments;
		} else {
			throw ('[debug] Failed to fetch tournaments list');
		}
	} catch (error) {
		console.error('Error fetching tournaments data:', error);
	}
};

export const getTournamentById = async (id:number): Promise<Tournaments | void> => {
	try {
		const response = await fetch(`/api/game-management-service/tournaments/${id}`);
		if (response.ok) {
			const tournament = await response.json();
		console.log('tournament:', tournament);
		return tournament;
		} else {
			throw ('[debug] Failed to fetch tournament by id');
		}
	} catch (error) {
		console.error('Error fetching tournament by id data:', error);
	}
};

export const createTournament = async (): Promise<Tournaments | void> => {
	const response = await fetch('/api/game-management-service/tournaments', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		throw new Error('Failed to createTournament');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('createTournament successful:', result);
	return result;
}

export const addPlayerToTournament = async (tournamentId:number, playerId:number): Promise<Tournaments | void> => {
	const response = await fetch(`/api/game-management-service/tournaments/${tournamentId}/addPlayer`, {
//	const response = await fetch(`/api/game-management-service/tournaments/${tournamentId}/players/${playerId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({playerId}),
	});

	if (!response.ok) {
		throw new Error('Failed to addPlayerToTournament');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('addPlayerToTournament successful:', result);
	return result;
}

export const closeRegistration = async (tournamentId:number): Promise<Tournaments | void> => {
	const response = await fetch(`/api/game-management-service/tournaments/${tournamentId}/closeRegistration`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to closeRegistrations');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('closeRegistrations successful:', result);
	return result;
}

export const generateNextRound = async (tournamentId:number): Promise<Tournaments | void> => {
	const response = await fetch(`/api/game-management-service/tournaments/${tournamentId}/generateNextRound`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to generateNextRound');
	}

	// Handle the response as needed
	const result = await response.json();
	console.log('generateNextRound successful:', result);
	return result;
}


export const getTounaments = async (pagination:Pagination,filter:Filter): Promise<{tournaments:Tournaments[],meta:MetaPagination} | void> => {
	//limit: 10, offset: 2, order: 'ASC'
	const { limit = 10, offset = 0, order = 'ASC' } = pagination;
	const { type ="remote" } = filter;
	try {
		const response = await fetch(`/api/users/me/tournaments?limit=${limit}&offset=${offset}&order=${order}&filters={"type":"${type}"}`);///games/pagination?limit=10&offset=2
		if (response.ok) {
			const {data, meta} = await response.json();
        console.log('games list:', data);
        return {tournaments:data,meta};
		} else {
			console.log ('[debug] Failed to fetch tournaments list');
			return {tournaments:[],meta:{limit:0,offset:0,order:'ASC',total:0}};
		}
	} catch (error) {
		console.error('Error fetching tournaments data:', error);
	}
};