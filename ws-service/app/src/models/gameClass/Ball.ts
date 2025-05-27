import { Position, Size } from "../../types/gameUtils.type";

export class Ball {
	position: Position;
	size: Size;
	velocity: Position; // dx, dy  
	private				_speed: number;
	
	constructor(initialPosition: Position, size: Size, initialVelocity: Position,private canvas: { width: number; height: number }) {
	  this.position = { ...initialPosition };
	  this.size = { ...size };
	  this.velocity = { ...initialVelocity };
		this.normalize();
		this._speed = 5;
	}
  
  	update () {
		this.position.x += this.velocity.x * this._speed;
		this.position.y += this.velocity.y * this._speed;
	}
	reset(/* position: Position, velocity: Position = this.velocity */) {
		this.spawn();

	 /*  this.position = { ...position };
	  this.velocity = { ...velocity }; */
	}
	toJSON() {
		return {
			position: this.position,
			size: this.size,
		};
	}

	private spawn () {
		const	x = this.canvas.width / 2;
		const	y = (33 + (Math.random() * 100) / 3) / 100 * this.canvas.height;
		this.position = { x: x, y: y };

		const	add = Math.random() * 30;
		let		vx = Math.sin((45 + add) * Math.PI / 180);
		let		vy = Math.cos((45 + add) * Math.PI / 180);
		const	base = Math.random() * 4;
		if (base < 2)				vx *= -1;
		if (base >= 1 && base < 3)	vy *= -1;

		this.velocity = { x: vx, y: vy };
		this.normalize();
	}
	
	normalize () {
		const	magnitude = this.magnitude();

		if (magnitude === 0) { this.velocity = { x: 0, y: 0 }; return ; }
		this.velocity.x = this.velocity.x / magnitude;
		this.velocity.y = this.velocity.y / magnitude;
	}

	private magnitude () {
		return Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) ;
	}
  }