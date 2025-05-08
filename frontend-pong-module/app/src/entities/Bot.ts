import { Player } from "./Player";

export class	Bot extends Player {

	private				_level: number;

	constructor (level: number) {
		super({name: 'Bot', role: 'bot'});
		this._level = level;
		console.log(`Bot created with level ${this._level}`);
	}
}