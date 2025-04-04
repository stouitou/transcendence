export class	Player {

	private readonly	_name: string;
	private				_points: number = 0;
	private				_location: number;

	private readonly	_bot: boolean;

	private				_display!: HTMLDivElement;

	private				_lastWin!: boolean;

	constructor (name: string, location: number, bot: boolean) {
		this._name = name;
		this._location = location;
		this._bot = bot;
	}

	get name () {
		return this._name;
	}

	get points () {
		return this._points;
	}
	
	get location () {
		return this._location;
	}
	
	get bot () {
		return this._bot;
	}
	
	get display () {
		return this._display;
	}
	
	get lastWin () {
		return this._lastWin;
	}

	set points (points: number) {
		this._points = points;
	}

	set location (location: number) {
		this._location = location;
	}

	set lastWin (lastWin: boolean) {
		this._lastWin = lastWin;
	}

	set display (display: HTMLDivElement) {
		this._display = display;
		this._display.style.position = 'relative';
		this._display.style.display = 'flex';
		this._display.style.alignItems = 'space-between';
		this._display.style.width = '50%';
		this._display.style.height = 'auto';
		this._display.style.margin = '5px';
		this._display.style.justifyContent = 'space-between';
		if (this._location === 0) {
			this._display.style.order = '1';
		}
		else if (this._location === 1) {
			this._display.style.order = '0';
		}
	}

	score () {
		this._points++;
		const score: HTMLParagraphElement = this._display.lastElementChild as HTMLParagraphElement;
		score.textContent = `${this._points}`;
	}
}