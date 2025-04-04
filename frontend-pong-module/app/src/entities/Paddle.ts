import { Object } from "./Object.ts"
import { Ball } from "./Ball.ts";

export class	Paddle extends Object {

	private readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private readonly	_speed: number = 3;
	private readonly	_bot: boolean;
	private				_moveUp: boolean = false;
	private				_moveDown: boolean = false;
	
	private readonly	_location: number;

	private				_x!: number;
	private				_y!: number;

	private				_top!: number;
	private				_bottom!: number;
	private				_left: number;
	private				_right: number;

	constructor (canvas: HTMLCanvasElement, location: number, bot: boolean) {
		super(canvas);

		this._location = location;
		this._y = (this._fieldHeight / 2) - (this._height / 2);
		if (this._location === 0) {
			this._x = this._fieldWidth - 5 - this._width;
		}
		else if (this._location === 1) {
			this._x = 5;
		}

		this._bot = bot;

		this._top = this._y;
		this._bottom = this._y + this._height;
		this._left = this._x;
		this._right = this._x + this._width;

		if (!this._bot) {
			this.eventListener();
		}
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

	move () {
		this.update();
		this.draw();
	}
	
	collision (ball: Ball) {
		if (ball.x + ball.radius >= this._left &&
			ball.x - ball.radius <= this._right &&
			ball.y + ball.radius >= this._top &&
			ball.y - ball.radius <= this._bottom) {
				ball.bounce(this);
				return (true);
			}
		return (false);
	}

	launchBot (ball: Ball) {
		if (this._y + (this._height / 2) > ball.y) {
			this._moveUp = true;
			this._moveDown = false;
		}
		else {
			this._moveUp = false;
			this._moveDown = true;
		}
		this.update();
		this.draw();
	}

	private draw () {
		this._field.fillStyle = this._color;
		this._field.beginPath();
		this._field.fillRect(this._x, this._y, this._width, this._height);
	}

	private update () {
		if (this._moveUp && this._top > 0)
			this._y -= this._speed;
		if (this._moveDown && this._bottom < this._fieldHeight)
			this._y += this._speed;
		this._top = this._y;
		this._bottom = this._y + this._height;
	}

	private eventListener () {
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
}