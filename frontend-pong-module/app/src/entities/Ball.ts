import { Object } from "./Object.ts";
import { Direction } from "./Direction.ts";
import { Paddle } from "./Paddle.ts";
import { Player } from "./Player.ts";
import * as Design from "./Design";

export class Ball extends Object {
	private readonly _diameter = 30;
	private readonly _radius   = this._diameter / 2;
	private readonly _speed    = 8;

	private _direction!: Direction;
	private _rebound   = false;

	private _x!: number;
	private _y!: number;
	private _top!: number;
	private _bottom!: number;
	private _left!: number;
	private _right!: number;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
		this.spawn();
	}

	/* ---------- getters ---------- */
	get radius()   { return this._radius; }
	get x()        { return this._x;      }
	get y()        { return this._y;      }
	get top()      { return this._top;    }
	get bottom()   { return this._bottom; }
	get left()     { return this._left;   }
	get right()    { return this._right;  }
	get direction(){ return this._direction; }

	/* ---------- core behaviour ---------- */
	spawn() {
		this._x = this._fieldWidth  / 2;
		this._y = (33 + (Math.random() * 100) / 3) / 100 * this._fieldHeight;

		const add = Math.random() * 30;
		let  vx   = Math.sin((45 + add) * Math.PI / 180);
		let  vy   = Math.cos((45 + add) * Math.PI / 180);
		const base = Math.random() * 4;
		if (base < 2)                  vx *= -1;
		if (base >= 1 && base < 3)     vy *= -1;

		this._direction = new Direction(vx, vy);
	}

	move() {
		this.updatePosition();
		this.draw();
	}

	bounce(paddle: Paddle) {
		this._rebound = true;
		this._direction.x *= -1;

		const impact = 2 * ((this._y - (paddle.y + paddle.height / 2)) / paddle.height);
		if (paddle.location === 0 || paddle.location === 1) {
			const angle =  ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180);
			this._direction.x = Math.cos(angle) * Math.sign(this._direction.x);
			this._direction.y = Math.sin(angle);
		} else {
			const angle = ((5 * Math.PI / 180) * impact) + (55 * Math.PI / 180);
			this._direction.x = Math.sin(angle) * Math.sign(this._direction.x);
			this._direction.y = -Math.cos(angle);
		}
	}

	out(players: Player[]) {
		if (this._right < 0) {
			players[0].score();
			this._rebound = false;
			return true;
		} else if (this._left > this._fieldWidth) {
			players[1].score();
			this._rebound = false;
			return true;
		} else if (this._bottom < 0 || this._top > this._fieldHeight) {
			this._rebound = false;
			return true;
		}
		return false;
	}

	/* ---------- glossy draw ---------- */
	private draw() {
		const ctx = this._field;
		const r   = this._radius;
		const x   = this._x;
		const y   = this._y;

		/* Radial gradient for glossy depth */
		const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
		g.addColorStop(0,   "#ff768e");
		g.addColorStop(0.55, Design.DESIGN.accentColor);
		g.addColorStop(1,   "#4c000d");
		ctx.fillStyle = g;

		/* blur pass for soft glow / motion feel */
		ctx.save();
		ctx.filter = "blur(2px)";
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		/* specular highlight */
		ctx.fillStyle = "rgba(255,255,255,.65)";
		ctx.beginPath();
		ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.15, r * 0.10, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	/* ---------- internals ---------- */
	private updatePosition() {
		let v = this._speed;
		if (!this._rebound) v /= 2;

		this._x += this._direction.x * v;
		this._y += this._direction.y * v;

		this._top    = this._y - this._radius;
		this._bottom = this._y + this._radius;
		this._left   = this._x - this._radius;
		this._right  = this._x + this._radius;
	}
}
