export class	Player {

	private readonly	_name: string;
	private				_points: number = 0;
	private readonly	_location: number;
	
	private				_display!: HTMLDivElement;

	constructor (name: string, location: number) {
		this._name = name;
		this._location = location;
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

	get display () {
		return this._display;
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