import { Object } from "./Object.ts"
import { Ball } from "./Ball.ts";
import { Player } from "./Player.ts";

export class	Paddle extends Object {

	private readonly	_owner: Player;
	private readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private readonly	_speed: number = 3;
	private readonly	_bot: boolean;
	private				_moveUp: boolean = false;
	private				_moveDown: boolean = false;
	private				_moveLeft: boolean = false;
	private				_moveRight: boolean =  false;
	
	private readonly	_location: number;

	private				_x!: number;
	private				_y!: number;

	private				_top!: number;
	private				_bottom!: number;
	private				_left!: number;
	private				_right!: number;

	constructor (canvas: HTMLCanvasElement, owner: Player, location: number, bot: string) {
		super(canvas);

		this._owner = owner;
		this._location = location;
		if (this._location === 0 || this._location === 1) {
			this._y = (this._fieldHeight / 2) - (this._height / 2);
			if (this._location === 0) {
				this._x = this._fieldWidth - 5 - this._width;
			}
			else if (this._location === 1) {
				this._x = 5;
			}
			this._top = this._y;
			this._bottom = this._y + this._height;
			this._left = this._x;
			this._right = this._x + this._width;
		}
		else if (this._location === 2 || this._location === 3) {
			this._x = (this._fieldWidth / 2) - (this._height / 2);
			if (this._location === 2) {
				this._y = this._fieldHeight - 5 - this._width;
			}
			else if (this._location === 3) {
				this._y = 5;
			}
			this._top = this._y;
			this._bottom = this._y + this._width;
			this._left = this._x;
			this._right = this._x + this._height;
		}
		this._bot = bot === 'bot' ? true : false;		

		if (!this._bot && (this._location === 0 || this._location === 1))
			this.eventListenerVertical();
		else if (!this._bot && (this._location === 2 || this._location === 3))
			this.eventListenerHorizontal();
	}

	get owner () {
		return this._owner ;
	}

	get color () {
		return this._color ;
	}

	get width () {
		return this._width ;
	}

	get height () {
		return this._height ;
	}

	get speed () {
		return this._speed ;
	}

	get bot () {
		return this._bot ;
	}

	get moveUp () {
		return this._moveUp ;
	}

	get moveDown () {
		return this._moveDown ;
	}

	get location () {
		return this._location ;
	}

	get x () {
		return this._x ;
	}

	get y () {
		return this._y ;
	}

	get top () {
		return this._top ;
	}

	get bottom () {
		return this._bottom ;
	}

	get left () {
		return this._left ;
	}

	get right () {
		return this._right ;
	}

	set moveUp (moveUp: boolean) {
		this._moveUp = moveUp ;
	}

	set moveDown (moveDown: boolean) {
		this._moveDown = moveDown ;
	}

	move (player: Player, ball: Ball) {
		if (player.role === 'bot') {
			if (this._location === 0 || this._location === 1)
				this.followBallVertical(ball);
			else if (this._location === 2 || this._location === 3) 
				this.followBallHorizontal(ball); }
		this.update();
		this.draw();
	}
	
	collision (ball: Ball) {
		if (ball.x + ball.radius >= this._left &&
			ball.x - ball.radius <= this._right &&
			ball.y + ball.radius >= this._top &&
			ball.y - ball.radius <= this._bottom) {
				console.log("location = ", this._location);
				ball.bounce(this);
				return (true);
			}
		return (false);
	}

	private followBallVertical (ball: Ball) {
		if (this._y + (this._height / 2) > ball.y) {
			this._moveUp = true;
			this._moveDown = false;
		}
		else {
			this._moveUp = false;
			this._moveDown = true;
		}
	}

	private followBallHorizontal (ball: Ball) {
		if (this._x + (this._height / 2) > ball.x) {
			this._moveLeft = true;
			this._moveRight = false;
		}
		else {
			this._moveLeft = false;
			this._moveRight = true;
		}
	}

	private draw () {
		this._field.fillStyle = this._color;
		this._field.beginPath();
		if (this._location === 0 || this._location === 1) {
			this._field.fillRect(this._x, this._y, this._width, this._height);
		}
		else if (this._location === 2 || this._location === 3) {
			this._field.fillRect(this._x, this._y, this._height, this._width);
		}
	}

	private update () {
		if (this._moveUp && this._top > 0)
			this._y -= this._speed;
		if (this._moveDown && this._bottom < this._fieldHeight)
			this._y += this._speed;

		if (this._moveRight && this._right < this._fieldWidth)
			this._x += this._speed;
		if (this._moveLeft && this._left > 0)
			this._x -= this._speed;
		
		this._left = this._x;
		this._top = this._y;
		if (this._location === 0 || this._location === 1) {
			this._bottom = this._y + this._height;
			this._right = this._x + this._width;
		}
		if (this._location === 2 || this._location === 3) {
			this._bottom = this._y + this._width ;
			this._right = this._x + this._height;
		}
	}

	private eventListenerVertical () {
		if (this._location === 0) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 'ArrowUp') {
					this._moveUp = true;
				}
				if (event.key === 'ArrowDown')
					this._moveDown = true;
			})
			document.addEventListener('keyup', (event) => {
				if (event.key === 'ArrowUp') {
					this._moveUp = false;
				}
				if (event.key === 'ArrowDown')
					this._moveDown = false;
			})
		}
		else if (this._location === 1) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 's')
					this._moveUp = true;
				if (event.key === 'x')
					this._moveDown = true;
			})
			document.addEventListener('keyup', (event) => {
				if (event.key === 's')
					this._moveUp = false;
				if (event.key === 'x')
					this._moveDown = false;
			})
		}
	}

	private eventListenerHorizontal () {
		if (this._location === 2) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 'ArrowLeft') {
					this._moveLeft = true;
				}
				if (event.key === 'ArrowRight')
					this._moveRight = true;
			})
			document.addEventListener('keyup', (event) => {
				if (event.key === 'ArrowLeft') {
					this._moveLeft = false;
				}
				if (event.key === 'ArrowRight')
					this._moveRight = false;
			})
		}
		else if (this._location === 3) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 'a')
					this._moveLeft = true;
				if (event.key === 'd')
					this._moveRight = true;
			})
			document.addEventListener('keyup', (event) => {
				if (event.key === 'a')
					this._moveLeft = false;
				if (event.key === 'd')
					this._moveRight = false;
			})
		}
	}
}