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

	private				_x!: number;
	private				_y!: number;

	private				_top!: number;
	private				_bottom!: number;
	private				_left!: number;
	private				_right!: number;

	private				_lastHit: Player | null = null;

	constructor (canvas: HTMLCanvasElement) {
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
		this._lastHit = paddle.owner;

		// Vecteur direction actuel de la balle
		const v = { x: this._direction.x, y: this._direction.y };

		// Normale du paddle
		let n: { x: number, y: number };
		if (paddle.owner.location === 0)       n = { x: 1, y: 0 };   // Left
		else if (paddle.owner.location === 1)  n = { x: -1, y: 0 };  // Right
		else if (paddle.owner.location === 2)  n = { x: 0, y: 1 };   // Top
		else                             n = { x: 0, y: -1 };  // Bottom

		// Dot product
		const dot = v.x * n.x + v.y * n.y;

		// Formule de réflexion vectorielle
		this._direction.x = v.x - 2 * dot * n.x;
		this._direction.y = v.y - 2 * dot * n.y;

		// Maintenant, ajoute un peu d'angle selon le point d’impact sur le paddle
		const tangent = { x: -n.y, y: n.x };
		let impactRatio = 0;

		if (n.x !== 0) {
			// Paddle vertical : impact sur Y
			impactRatio = (this._y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
		} else {
			// Paddle horizontal : impact sur X
			impactRatio = (this._x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
		}

		// Clamp entre -1 et 1
		impactRatio = Math.max(-1, Math.min(1, impactRatio));

		// Ajoute une légère déviation angulaire tangentielle
		const deviationStrength = 0.4; // plus petit = plus droit
		this._direction.x += tangent.x * impactRatio * deviationStrength;
		this._direction.y += tangent.y * impactRatio * deviationStrength;

		// Normalise
		const mag = Math.sqrt(this._direction.x ** 2 + this._direction.y ** 2);
		this._direction.x /= mag;
		this._direction.y /= mag;
		// const	angleMin = 5 * Math.PI / 180;
		// const	angleMax = 60 * Math.PI / 180;
		// let		angle: number;
		// let 	impact: number;

		// switch (paddle.location) {
		// 	case 0:
		// 	case 1:
		// 		console.log('paddle.location', paddle.location);
		// 		impact = 2 * ((this._y - (paddle.y + (paddle.height / 2))) / paddle.height);
		// 		angle = angleMin + ((angleMax - angleMin) * Math.abs(impact));	// get an angle between 5 and 60 degrees
		// 		this._direction.x = Math.cos(angle) * (paddle.location === 0 ? 1 : -1);
		// 		this._direction.y = Math.sin(angle) * Math.sign(impact);
		// 		break ;

		// 	case 2:
		// 	case 3:
		// 		impact = 2 * ((this._x - (paddle.x + (paddle.width / 2))) / paddle.width);
		// 		angle = angleMin + ((angleMax - angleMin) * Math.abs(impact));
		// 		this._direction.y = Math.cos(angle * (paddle.location === 2 ? 1 : -1));
		// 		this._direction.x = Math.sin(angle) * Math.sign(impact);
		// 		break ;
		// }
	// this._direction.x *= -1;	

	// 	if (paddle.location === 0 || paddle.location === 1) {
	// 		// Formula for the rebound : θrebound ​= θmax ​× (2 × ((yimpact ​− ypaddle) / paddle height)​)
	// 		const impact: number = 2 * ((this._y - (paddle.y + (paddle.height / 2))) / paddle.height);
	// 		const angle = ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180);	// get an angle between 5 and 60 degrees
	// 		this._direction.x = Math.cos(angle) * Math.sign(this._direction.x);
	// 		this._direction.y = Math.sin(angle);
	// 	}
	// 	else if (paddle.location === 2 || paddle.location === 3) {
	// 		const impact: number = 2 * ((this._x - (paddle.x + (paddle.width / 2))) / paddle.width);
	// 		const angle = ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180);
	// 		this._direction.y = Math.cos(angle) * Math.sign(this._direction.y);
	// 		this._direction.x = Math.sin(angle);
	// 	}
	// 	else {
	// 		const impact: number = 2 * ((this._y - (paddle.y + (paddle.height / 2))) / paddle.height);
	// 		const angle: number = ((5 * Math.PI / 180) * impact) + (55 * Math.PI / 180);	// get an angle between 5 and 60 degrees
	// 		this._direction.x = Math.sin(angle) * Math.sign(this._direction.x);
	// 		this._direction.y = -Math.cos(angle);
	// 	}
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
			return true ;
		}
		return false ;
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
