import { Paddle } from "./Paddle";

export class	Player{

	protected readonly		_name: string;
	protected readonly		_role: string;

	protected				_points: number = 0;
	protected				_location: number = 0;

	protected				_display: HTMLDivElement;
	protected				_paddle: Paddle | null = null;	

	protected				_lastWin: boolean = false;

	constructor (json: any) {
		this._name = json.name;
		if (!this._name)
			this._name = 'Host';
		this._role = json.role;
		if (!this._role)
			this._role = 'user';

		this._display = document.createElement('div');
		this.displayProperties();
	}

	/* ---------- getters ---------- */
	get name () { return this._name ; }
	get role () { return this._role ; }
	get lastWin () { return this._lastWin ; }
	get points () { return this._points ; }
	get location () { return this._location ; }
	get display () { return this._display ; }
	get paddle () : Paddle | null { return this._paddle ; }

	/* ---------- setters ---------- */
	set points (points: number) { this._points = points; }
	set location (location: number) { this._location = location; }
	set paddle (paddle: Paddle) { this._paddle = paddle; }
	set lastWin (lastWin: boolean) { this._lastWin = lastWin; }

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

	losePoint () {
		if (this._points === 0)
			return ;
		this._points--;
		const score: HTMLParagraphElement = this._display.lastElementChild as HTMLParagraphElement;
		score.textContent = `${this._points}`;
	}
}