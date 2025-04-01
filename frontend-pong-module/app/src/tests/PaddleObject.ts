import { Object } from "./Object.ts"

export class	PaddleObject extends Object {

	private readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private readonly	_speed: number = 5;
	private				_moveUp: boolean = false;
	private				_moveDown: boolean = false;
	
	private readonly	_location: number;

	private				_x!: number;
	private				_y!: number;


	constructor (canvas: HTMLCanvasElement, location: number) {
		super(canvas);

		this._location = location;
		this._y = (this._fieldHeight / 2) - (this._height / 2);
		if (this._location === 0) {
			this._x = this._fieldWidth - 5 - this._width;
		}
		else if (this._location === 1) {
			this._x = 5;
		}

		this.eventListener();
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

	get moveUp () {
		return this._moveUp ;
	}

	get moveDown () {
		return this._moveDown ;
	}

	get x () {
		return this._x ;
	}

	get y () {
		return this._y ;
	}

	move () {
		this.update();
		this.draw();
	}
	
	private draw () {
		this._field.fillStyle = this._color;
		this._field.beginPath();
		this._field.fillRect(this._x, this._y, this._width, this._height);
	}

	private update () {
		if (this._moveUp)
			this._x -= this._speed;
		if (this._moveDown)
			this._x += this._speed;
	}

	private eventListener () {
		if (this._location === 0) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 'ArrowUp') {
					console.log("arrow up");
					this._moveUp = true;
				}
				if (event.key === 'ArrowDown')
					this._moveDown = true;
			})
		}
		else if (this._location === 1) {
			document.addEventListener('keydown', (event) => {
				if (event.key === 's')
					this._moveUp = true;
				if (event.key === 'x')
					this._moveDown = true;
			})
		}
	}
}