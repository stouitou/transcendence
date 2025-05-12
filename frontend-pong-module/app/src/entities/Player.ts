import { Ball } from "./Ball";
//import { HistoriqueGame } from "../Interfaces/HistoriqueGame.interface";
import { Paddle, Position } from "./Pong";
//import { Paddle } from "./Paddle";
import { InputManager } from "./managers/InputManager";
import { Bot } from "./Bot";

type Direction = "left" | "right" | "top" | "bottom"
const directions:Direction[] = ['left', 'right', 'top', 'bottom'];
export /* abstract */ class	Player{

		//id: string;
		state: string = 'waiting'; // waiting, playing, finished
		//name: string = 'host';
		isRemote: boolean = false;
		isIA: boolean = false;
		isInGame: boolean = false;
		//paddle: Paddle;
		//direction: Direction;
		score: number = 0;
		position: Position = { x: 0, y: 0 };

	protected readonly		_id: string;
	protected readonly		_name: string;

	protected				_paddle: Paddle | null = null;
	/* protected */			_location: number = 0;
	//protected				_points: number; -> score
	protected				_direction: Direction /* | null = null */;

//	protected				_keyPressed: Set<string> = new Set();
	//protected				_display: HTMLDivElement;
	protected				_lastWin: boolean = false;

	//private				_historiqueGame: HistoriqueGame;

	_historyPlayer = {bounceCount: 0, goalsConceded: 0};
	bot:Bot | null = null;

	constructor (json: any,index: number,public inputManager: InputManager) {
		
		//this._historiqueGame = { maxBounceCount: 0, mostGoalsConcededPlayer: 0, playerWithMostPointsLost: 0, totalBouncesPerPlayer: 0};
		this.paddle = new Paddle(json.paddle.position, json.paddle.size);
		this.direction = directions[index];
			this._id = json.id;
			this._name = json.name;
			this.isRemote = json.isRemote;
			this.isIA = json.isIA;
			this.isInGame = json.isInGame;
			this.score = json.score?? 0;
			this._direction = directions[index];
			this._location = index;
			this.bot = new Bot(1, this);
		
	}

	/* ---------- getters ---------- */
	get id ()						{ return this._id ; }
	get name ()						{ return this._name ; }
	get paddle () : Paddle | null	{ return this._paddle ; }
	get location ()					{ return this._location ; }
	//get points ()					{ return this._points ; } -> score
	get direction (): string | null	{ return this._direction ; }
//	get keyPressed ()				{ return this._keyPressed ; } -> gerer par InputManager
//	get display ()					{ return this._display ; } -> gerer par Renderer
	get lastWin ()					{ return this._lastWin ; }
//	get historiqueGame ()			{ return this._historiqueGame ; }

	/* ---------- setters ---------- */
	set paddle (paddle: Paddle)					{ this._paddle = paddle; }
	set location (location: number)				{ this._location = location; }
	//set points (points: number)					{ this._points = points; }
	set	direction (direction: Direction/* string | null */)	{ this._direction = direction; }
	set lastWin (lastWin: boolean)				{ this._lastWin = lastWin; }
	//set historiqueGame (historiqueGame: HistoriqueGame)			{ this._historiqueGame = historiqueGame }

	setScore(score: number) {
		this.score = score;
	}

	updateMovement(ball: Ball) {
		if (this.isIA) {
		  this.bot?.move(ball);
		  const movement = this.inputManager.getMovementByDirection();
		 this.inputManager.clearDirection();
		  this._paddle?.move(movement.dx, movement.dy);
		} else if (this.inputManager) {
		  const movement = this.inputManager.getDirectionMovement();
		  this._paddle?.move(movement.dx, movement.dy);
		}
	  }
	toJSON() {
		return {
			id: this._id,
			state: this.state,
			name: this._name,
			isRemote: this.isRemote,
			isIA: this.isIA,
			isInGame: this.isInGame,
			score: this.score,
			paddle: {
				position: this.paddle?.position,
				size: this.paddle?.size,
			},
			position: this.paddle?.position,
		};
	}

}