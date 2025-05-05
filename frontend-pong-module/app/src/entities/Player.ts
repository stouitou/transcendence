import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { HistoriqueGame } from "../Interfaces/HistoriqueGame.interface";

export abstract class	Player{

	protected readonly		_id: string;
	protected readonly		_name: string;

	protected				_paddle: Paddle | null = null;
	protected				_location: number = 0;
	protected				_points: number;
	protected				_direction: string | null = null;

	protected				_keyPressed: Set<string> = new Set();
	protected				_display: HTMLDivElement;
	protected				_lastWin: boolean = false;

	private				_historiqueGame: HistoriqueGame;

	constructor (json: any) {
		this._historiqueGame = { maxBounceCount: 0, mostGoalsConcededPlayer: 0, playerWithMostPointsLost: 0, totalBouncesPerPlayer: 0};
		this._id = json.id;
		this._name = json.name;
		if (!this._name)
			this._name = this.setName();

		this._points = 0;
		this._display = document.createElement('div');
		this.displayProperties();
	}

	/* ---------- getters ---------- */
	get id ()						{ return this._id ; }
	get name ()						{ return this._name ; }
	get paddle () : Paddle | null	{ return this._paddle ; }
	get location ()					{ return this._location ; }
	get points ()					{ return this._points ; }
	get direction (): string | null	{ return this._direction ; }
	get keyPressed ()				{ return this._keyPressed ; }
	get display ()					{ return this._display ; }
	get lastWin ()					{ return this._lastWin ; }
	get historiqueGame ()			{ return this._historiqueGame ; }

	/* ---------- setters ---------- */
	set paddle (paddle: Paddle)					{ this._paddle = paddle; }
	set location (location: number)				{ this._location = location; }
	set points (points: number)					{ this._points = points; }
	set	direction (direction: string | null)	{ this._direction = direction; }
	set lastWin (lastWin: boolean)				{ this._lastWin = lastWin; }
	set historiqueGame (historiqueGame: HistoriqueGame)			{ this._historiqueGame = historiqueGame }

	abstract move (ball: Ball) : void ;

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

	private displayProperties () {
		this._display.style.position = 'relative';
		this._display.style.display = 'flex';
		this._display.style.alignItems = 'space-between';
		this._display.style.width = '50%';
		this._display.style.height = 'auto';
		this._display.style.margin = '5px';
		this._display.style.justifyContent = 'space-between';
	}

	private setName () : string {
		const	names: string[] = [
			'Alexandre',
			'Jules',
			'Enzo',
			'Arthur',
			'Thomas',
			'Louis',
			'Deborah',
			'Amelie',
			'Zoe',
			'Dorian',
			'Walid',
			'Florent',
			'Anastasia',
			'Gregoire',
			'Sophia',
			'Timothee',
			'Romain',
			'Emma',
			'Karine',
			'Lucas',
			'Fatima',
			'Clement',
			'Mohamed',
			'Simon',
			'Octave',
			'Jose',
			'Camille',
			'Charles',
			'Franck',
			'Ludovic',
			'Noe',
			'Iris',
			'Shaineze',
			'Sami',
			'Lea',
			'Adrien',
			'Theo',
			'Charlie',
			'Marine',
			'Anne',
		]
		const	nameIndex = Math.random() * 30;
		const	number = Math.random() * 100;

		return names[Math.floor(nameIndex)] + '-' + Math.floor(number) ;
	}
}