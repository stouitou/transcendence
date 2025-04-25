import { Object } from "./Object.ts";
import { Direction } from "./Direction.ts";
import { Paddle } from "./Paddle.ts";
import { Player } from "./Player.ts";
import * as Design from "./Design";

export class Ball extends Object {

	private readonly	_diameter = 30;
	private readonly	_radius   = this._diameter / 2;

	private readonly	_speed    = 8;
	private				_direction!: Direction;

	private				_x!: number;
	private				_y!: number;

	private				_top!: number;
	private				_bottom!: number;
	private				_left!: number;
	private				_right!: number;

	private				_rebound   = false;
	private				_lastHit: Player | null = null;

	constructor (canvas: HTMLCanvasElement) {
		super(canvas);
		this.spawn();
	}

	/* ---------- getters ---------- */
	get diameter ()		{ return this._diameter ; }
	get radius ()		{ return this._radius ; }
	get speed ()		{ return this._speed ; }
	get direction ()	{ return this._direction ; }
	get x ()			{ return this._x ; }
	get y ()			{ return this._y ; }
	get top ()			{ return this._top ; }
	get bottom ()		{ return this._bottom ; }
	get left ()			{ return this._left ; }
	get right ()		{ return this._right ; }

	/* ---------- core behaviour ---------- */
	spawn() {
		this._x = this._fieldWidth  / 2;
		this._y = (33 + (Math.random() * 100) / 3) / 100 * this._fieldHeight;

		const	add = Math.random() * 30;
		let		vx = Math.sin((45 + add) * Math.PI / 180);
		let		vy = Math.cos((45 + add) * Math.PI / 180);
		const	base = Math.random() * 4;
		if (base < 2)				vx *= -1;
		if (base >= 1 && base < 3)	vy *= -1;

		this._direction = new Direction(vx, vy);
	}

	move() {
		this.updatePosition();
		this.draw();
	}

	bounce(paddle: Paddle, side: string) {
		console.log('collision on side: ', side);
		console.log('direction before rebound: x = ', this._direction.x, ', y = ', this._direction.y);
		this._rebound = true;
		this._lastHit = paddle.owner;

		let	normal: { x: number, y: number } = { x: 0, y: 0};
		switch (side) {
			case 'left':	normal = { x: 1, y: 0 }; this._x = paddle.left - this._radius; break ;
			case 'right':	normal = { x: -1, y: 0 }; this._x = paddle.right + this._radius; break ;
			case 'top':		normal = { x: 0, y: 1 }; this._y = paddle.top - this._radius; break ;
			case 'bottom':	normal = { x: 0, y: -1 }; this._y = paddle.bottom + this._radius; break ;
		}

		// Vectorial reflection formula
		const	dot = (this._direction.x * normal.x) + (this._direction.y * normal.y);
		this._direction.x = this._direction.x - (2 * dot * normal.x);
		this._direction.y = this._direction.y - (2 * dot * normal.y);

		// Compute deviation depending on impact point
		const	cross = { x: -normal.y, y: normal.x };
		let impactRatio = 0;

		if (normal.x !== 0) {
			// Paddle vertical : impact sur Y
				impactRatio = ((paddle.y + paddle.height / 2) - this._y) / (paddle.height / 2);
		} else {
			// Paddle horizontal : impact sur X
				impactRatio = (this._x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
		}

		// Clamp entre -1 et 1
		impactRatio = Math.max(-1, Math.min(1, impactRatio));
		console.log('impact ratio: ', impactRatio);

		// Ajoute une légère déviation angulaire tangentielle
		const deviationStrength = 0.5; // plus petit = plus droit
		this._direction.x += cross.x * impactRatio * deviationStrength;
		this._direction.y += cross.y * impactRatio * deviationStrength;
		this._direction.normalize();
		console.log('direction after rebound: x = ', this._direction.x, ', y = ', this._direction.y);
	}

	out (players: Player[]) : boolean {
		if (this._right < 0 || this._left > this._fieldWidth || this._bottom < 0 || this._top > this._fieldHeight) {
			if (this._left > this._fieldWidth) {
				if (this._lastHit === null || this._lastHit.location === 0) {
					players[0].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._right < 0) {
				if (this._lastHit === null || this._lastHit.location === 1) {
					players[1].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._top > this._fieldHeight) {
				if (this._lastHit === null || this._lastHit.location === 2) {
					players[2].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._bottom < 0) {
				if (this._lastHit === null || this._lastHit.location === 3) {
					players[3].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			this._rebound = false;
			this._lastHit = null;
			return true ;
		}
		return false ;
	}

	/* ---------- internals ---------- */
	private updatePosition() {
		let	speed = this._speed;
		if (!this._rebound)	speed /= 2;

		this._x += this._direction.x * speed;
		this._y += this._direction.y * speed;

		this._top    = this._y - this._radius;
		this._bottom = this._y + this._radius;
		this._left   = this._x - this._radius;
		this._right  = this._x + this._radius;
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
}
