import { Direction } from "../../types/gameUtils.type";
import { Paddle } from "./Paddle";
import { WaitingPlayers } from "../../services/ws.service";
import { Bot } from "./Bot";

const	directions: Direction[] = [ 'left', 'right', 'top', 'bottom' ];
export class	Player {

	private				_id: number; // peut être "local", "remote-1", etc.
	private readonly	_name: string = 'host';
	private readonly	_userId: number = -1;
	private readonly	_isRemote: boolean = false;
	private readonly	_avatar: string = '/uploads/1-avatartest.jpg';
	private				_state: string = 'waiting'; // "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled"

	private readonly	_isIA: boolean = false;
	private				_isInGame: boolean = false;

	private				_score: number = 0;

	private				_paddle: Paddle | null = null;
	private				_location: number;
	private				_direction: Direction;
	private				_position: { x: number,y: number };
	private readonly	_size: { width: number, height: number };
	private readonly	_initialPosition: {x:number,y:number}[] = [ { x: 775, y: 250 }, { x: 5, y: 250 }, { x: 450, y: 575 }, { x: 450, y: 5 } ];
	private readonly	_sizes: { width: number, height: number }[] = [ { width: 20, height: 100 }, { width: 20, height: 100 }, { width: 100, height: 20 }, { width: 100, height: 20 } ];
	private				_index: number = 0;

	private				_lastWin: boolean = false;
	private readonly	_history = { bounceCount: 0, goalsConceded: 0, distance: 0 };
	public				bot: Bot | null = null; // Bot instance if the player is a bot
	public				directionReceived: 'up' | 'down' | 'left' | 'right' | null = null;

	constructor (jsonData: WaitingPlayers, index: number = 0, difficulty: number = 1) {
		/**
		 * 
				userId: 'User-3',
				id: 3,
				name: 'IA-4',
				avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
				state: 'subscribe',
				isInGame: false,
				isIA: true,
				position: [Object],
				size: [Object],
				score: 0
		 */
		this._index = index;
		this._size =this._sizes[index];
		this._position = this._initialPosition[index];//@TODO doublon
		this.paddle = new Paddle(this._position, this._size);
		this._location = index;
		this._direction = directions[index];

		this._id = jsonData.id??-1;
		this._userId = jsonData.userId?? -1;
		this._name = jsonData.name?? 'guest';//@TODO
		//this.isRemote = jsonData.isRemote;
		this._avatar = jsonData.avatar?? '/uploads/1-avatartest.jpg';
		this._isIA = jsonData.isIA;
		this.isInGame = this._isIA?true:jsonData.isInGame;
		this.score = jsonData.score?? 0;
		//add bot if isIA
		if (this._isIA) {
			this.bot = new Bot(difficulty, this);
		}
			
	}

	/* ---------- getters ---------- */
	get id ()						{ return this._id ; }
	get name ()						{ return this._name ; }
	get userId ()					{ return this._userId ; }
	get avatar ()					{ return this._avatar ; }
	get isIA ()						{ return this._isIA ; }
	get paddle () : Paddle | null	{ return this._paddle ; }
	get location ()					{ return this._location ; }
	get score ()					{ return this._score ; }
	get direction (): string | null	{ return this._direction ; }
	get position ()					{ return this._position ; }
	get size ()						{ return this._size ; }
	get lastWin ()					{ return this._lastWin ; }
	get history ()					{ return this._history ; }

	/* ---------- setters ---------- */
	set id (id: number)							{ this._id = id; }
	set state (state: string)					{ this._state = state; }
	set isInGame (isInGame: boolean)			{ this._isInGame = isInGame; }
	set paddle (paddle: Paddle)					{ this._paddle = paddle; }
	set lastWin (lastWin: boolean)				{ this._lastWin = lastWin; }
	set score (score: number)					{ this._score = score; }


	toJSON (): any { //@BUG 
		return {
			id: this.id,
			userId: this._userId,
			name: this._name,
			avatar: this._avatar,
			state: this.state,
			isInGame: this.isInGame,
			isIA: this._isIA,
			position: this._position,
			size: this._size,
			score: this.score
		};
	}
}