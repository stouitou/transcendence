import { Direction } from './Direction.js';
import { Display } from '../display/Display.js';
import { Paddle } from "./Paddle.js";

// export allows to use this class in another file
export class	Ball extends Display {

	/* ATTRIBUTES */
	private readonly	_element: HTMLDivElement;
	private readonly	_diameter: number = 30;
	private readonly	_radius: number = this._diameter / 2;
	private readonly	_color: string = "rgb(255, 0, 0)";

	// For the movement
	private readonly	_speed: number = 8;
	private readonly	_startingSpeed: number = 4;
	private readonly	_direction: Direction;

	// Fetch current coordinates
	private				_top!: number;
	private				_bottom!: number;
	private				_left!: number;
	private				_right!: number;

	/* CONSTRUCTOR */
	constructor (canvas: HTMLDivElement) {
		super(canvas);

		// Creates the ball object
		this._element = document.createElement("div");
		// Gives the ball basic values
		this._element.style.width = `${this._diameter}px`;
		this._element.style.height = `${this._diameter}px`;
		this._element.style.backgroundColor = this._color;					// color of the ball
		this._element.style.borderRadius = "50%";							// makes it round
		this._element.style.position = "absolute";							// doesn't interact with other objects or text
		this._element.style.margin = "0%";
		this._element.style.padding = "0%";
		this._element.style.border = "0%";
		// this._element.style.display = "none";							// doesn't interact with other objects or text
		this._canvas.appendChild(this._element);

		// Gives the ball a random direction and position
		this._direction = new Direction(0, 0);
		this.spawn();

		this.updatePosition();
	}
	
	/* GETTERS */
	public get element () {
		return this._element;
	}
	
	public get diameter () {
		return this._diameter;
	}	
	
	public get direction () {
		return this._direction;
	}	

	public get speed () {
		return this._speed;
	}	

	public get startingSpeed () {
		return this._startingSpeed;
	}	

	public get top () {
		return this._top;
	}	
	
	public get bottom () {
		return this._bottom;
	}	
	
	public get left () {
		return this._left;
	}	
	
	public get right () {
		return this._right;
	}	

	/* METHODS */
	// Update current position
	public updatePosition () {
		this._top = this._element.offsetTop;
		this._bottom = this._top + this._diameter;
		this._left = this._element.offsetLeft;
		this._right = this._left + this._diameter;
	}
	
	public spawn () {
		// Randomize position
		const pos = (Math.random() * 100) / 3;
		const top = 33 + pos;

		this._element.style.top = `${top}%`;
		this._element.style.left = "50%";				// centered horizontally (15px is half the size of the ball)
		this.updatePosition();
		
		// Ramdomize direction
		const add = Math.random() * 30;

		this._direction.x = Math.sin((45 + add) * Math.PI / 180);	// compute x direction depending on an angle between 45 and 75 degrees
		this._direction.y = Math.cos((45 + add) * Math.PI / 180);	// compute y direction depending on an angle between 45 and 75 degrees

		let base = Math.round(Math.random());	// random integer between 0 and 1
		if (base === 0)
			this._direction.x *= -1;
		base = Math.round(Math.random());
		if (base === 0)
			this._direction.y *= -1;
		// if spawn up and direction down, do we need to manage differently ?
	}

	public move(speed: number) {
		this._direction.normalize();
		this._element.style.left = `${this._element.offsetLeft + (speed * this._direction.x)}px`
		this._element.style.top = `${this._element.offsetTop + (speed * this._direction.y)}px`
	}

	public bounce(paddle: Paddle) {
		if (paddle.location === 1 || paddle.location === 2) {
			this._direction.x *= -1;	

			// Position the ball outside of the paddle to avoid being blocked
			if (paddle.location === 1)
				this._element.style.right = `calc(${paddle.left} - 1)px`;
			else
				this._element.style.left = `calc(${paddle.right} + 1)px`;
			
			// Formula for the rebound : θrebound ​= θmax ​× (2 × ((yimpact ​− ypaddle) / paddle height)​)
			const impact: number = 2 * (((this._top + this._radius) - (paddle.top + (paddle.height / 2))) / paddle.height);
			const angle = ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180);	// get an angle between 5 and 60 degrees
			this._direction.x = Math.cos(angle) * Math.sign(this._direction.x);
			this._direction.y = Math.sin(angle);
		}

		else {
			this._direction.x *= -1;	

			if (paddle.location === 3) {
				this._element.style.bottom = `calc(${paddle.top} - 1)px`;
			}
			else {
				this._element.style.top = `calc(${paddle.bottom} + 1)px`;
			}

			// Formula for the rebound : θrebound ​= θmax ​× (2 × ((yimpact ​− ypaddle) / paddle height)​)
			const impact: number = 2 * (((this._top + this._radius) - (paddle.top + (paddle.height / 2))) / paddle.height);
			const angle = ((5 * Math.PI / 180) * impact) + (55 * Math.PI / 180);	// get an angle between 5 and 60 degrees
			this._direction.x = Math.sin(angle) * Math.sign(this._direction.x);
			this._direction.y = -Math.cos(angle);
		}
	}
}
