import { User } from "./User";

export class	Player extends User{

	private				_points: number = 0;
	private				_location: number = 0;

	private				_display: HTMLDivElement;

	private				_lastWin: boolean = false;

	constructor (json: any) {
		super(json);
		this._display = document.createElement('div');
		this.displayProperties();
	}

	get lastWin () {
		return this._lastWin;
	}

	set lastWin (lastWin: boolean) {
		this._lastWin = lastWin;
	}

	get points () {
		return this._points;
	}
	
	get location () {
		return this._location;
	}
	
	get display () {
		return this._display;
	}

	set points (points: number) {
		this._points = points;
	}

	set location (location: number) {
		this._location = location;
	}

	private displayProperties () {
		this._display.style.position = 'relative';
		this._display.style.display = 'flex';
		this._display.style.alignItems = 'space-between';
		this._display.style.width = '50%';
		this._display.style.height = 'auto';
		this._display.style.margin = '5px';
		this._display.style.justifyContent = 'space-between';
	}

	score () {
		this._points++;
		const score: HTMLParagraphElement = this._display.lastElementChild as HTMLParagraphElement;
		score.textContent = `${this._points}`;
	}
}