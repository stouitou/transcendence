import { Ball } from './Ball';
import { InputManager } from "./managers/InputManager";
import { Bot } from "./Bot";
import { Paddle } from './Paddle';

type	Direction = "left" | "right" | "top" | "bottom";
const	directions: Direction[] = [ 'left', 'right', 'top', 'bottom' ];
export class	Player {

	private readonly	_id: string;
	private readonly	_name: string;

	private readonly	_isIA: boolean;
	private				_state: string = 'waiting';	// waiting, playing, finished
	private readonly	_isRemote: boolean = false;
	private				_isInGame: boolean = false;
	
	public				inputManager: InputManager;
	private				_score: number = 0;

	private				_paddle: Paddle | null = null;
	private				_location: number = 0;
	private				_direction: Direction;

	private				_lastWin: boolean = false;

	private readonly	_historyPlayer = {bounceCount: 0, goalsConceded: 0};
	public				bot: Bot | null = null;

	constructor (json: any, index: number, inputManager: InputManager) {
		this.inputManager = inputManager;
		this.paddle = new Paddle(json.paddle.position, json.paddle.size);
		this._direction = directions[index];
		this._id = json.id;
		this._name = json.name;
		this._isRemote = json.isRemote;
		this._isIA = json.isIA;
		this._isInGame = json.isInGame;
		this._score = json.score?? 0;
		this._direction = directions[index];
		this._location = index;
		this.bot = new Bot(1, this);
	}

	/* ---------- getters ---------- */
	get id ()						{ return this._id ; }
	get name ()						{ return this._name ; }
	get paddle () : Paddle | null	{ return this._paddle ; }
	get location ()					{ return this._location ; }
	get score ()					{ return this._score ; }
	get direction (): string | null	{ return this._direction ; }
	get lastWin ()					{ return this._lastWin ; }
	get historyPlayer ()			{ return this._historyPlayer ; }

	/* ---------- setters ---------- */
	set state (state: string)					{ this._state = state; }
	set isInGame (isInGame: boolean)			{ this._isInGame = isInGame; }
	set paddle (paddle: Paddle)					{ this._paddle = paddle; }
	set lastWin (lastWin: boolean)				{ this._lastWin = lastWin; }
	set score (score: number)					{ this._score = score; }

	updateMovement (ball: Ball) {
		if (this._isIA) {
			this.bot?.move(ball);
			const	movement = this.inputManager.getMovementByDirection();
			this.inputManager.clearDirection();
			this._paddle?.move(movement.dx, movement.dy);
		} else {
			const	movement = this.inputManager.getDirectionMovement();
			this._paddle?.move(movement.dx, movement.dy);
		}
	}

	toJSON () {
		return {
			id: this._id,
			state: this._state,
			name: this._name,
			isRemote: this._isRemote,
			isIA: this._isIA,
			isInGame: this._isInGame,
			score: this._score,
			paddle: {
				position: this.paddle?.position,
				size: this.paddle?.size,
			},
			position: this.paddle?.position,
		};
	}
}