import { Coordinates } from "../Interfaces/Coordinates.interface.ts";
import { Direction } from "./Direction.ts";
import { Ground } from "../Interfaces/Ground.interface.ts";
import { Paddle } from "./Paddle.ts";
import { Player } from "./Player.ts";
import { Position } from "../Interfaces/Position.interface.ts";
import * as Design from "./Design";

export class Ball {

	private readonly	_ground: Ground;

	private readonly	_radius   = 15;
	private readonly	_speed    = 8;

	private				_direction!: Direction;
	private				_position!: Position;
	private				_coordinates!: Coordinates;

	private				_rebound   = false;

	private				_lastHit: Player | null = null;

	constructor (ground: Ground) {
		this._ground = ground;
	}

	/* ---------- getters ---------- */
	get radius ()		{ return this._radius ; }
	get speed ()		{ return this._speed ; }
	get direction ()	{ return this._direction ; }
	get	position ()		{ return this._position ; }
	get	coordinates ()	{ return this._coordinates ; };

	/* ---------- core behaviour ---------- */
	spawn() {
		const	x = this._ground.width  / 2;
		const	y = (33 + (Math.random() * 100) / 3) / 100 * this._ground.height;
		this._position = { x: x, y: y };

		const	add = Math.random() * 30;
		let		vx = Math.sin((45 + add) * Math.PI / 180);
		let		vy = Math.cos((45 + add) * Math.PI / 180);
		const	base = Math.random() * 4;
		if (base < 2)				vx *= -1;
		if (base >= 1 && base < 3)	vy *= -1;

		this._coordinates = { top: y - this._radius, bottom: y + this._radius, left: x - this._radius, right: x + this._radius };
		this._direction = new Direction(vx, vy);
	}

	bounce(paddle: Paddle, side: string) {
		// if (this._lastHit === paddle.owner)	{ return ; }
		console.log('--- bounce ---');
		console.log('paddle right: ', paddle.coordinates.right);
		console.log('ball left: ', this._coordinates.left);
		console.log('Side:', side);
		console.log('Before bounce:');
		console.log('  Ball position:', { x: this._position.x.toFixed(1), y: this._position.y.toFixed(1) });
		console.log('  Ball direction:', { x: this._direction.x.toFixed(3), y: this._direction.y.toFixed(3) });
		console.log('  Ball speed:', this._speed);
		this._rebound = true;
		this._lastHit = paddle.owner;
		
		let	impactRatio = 0;
		if (side === 'left' || side === 'right') {
			impactRatio = (this._position.y - (paddle.position.y + paddle.height / 2)) / (paddle.height / 2);
		}
		else if (side === 'top' || side === 'bottom') {
			impactRatio = ((this._position.x - (paddle.position.x + paddle.width / 2)) / (paddle.width / 2));
		}
		impactRatio = Math.max(-1, Math.min(1, impactRatio));
		console.log('Impact ratio:', impactRatio.toFixed(2));
		
		const	maxAngle = 60 * Math.PI / 180;
		const	angle = impactRatio * maxAngle;
		console.log('Angle (deg):', (angle * 180 / Math.PI).toFixed(1));
		
		if (side === 'left' || side === 'right') {
			const	directionSign = (side === 'right') ? 1 : -1;
			this._direction.x = Math.cos(angle) * directionSign;
			this._direction.y = Math.sin(angle);
		}
		if (side === 'top' || side === 'bottom') {
			const	directionSign = (side === 'bottom') ? 1 : -1;
			this._direction.x = Math.sin(angle);
			this._direction.y = Math.cos(angle) * directionSign;
		}
		
		this._direction.normalize();
		console.log('New direction:', {
			x: this._direction.x.toFixed(3),
			y: this._direction.y.toFixed(3)
		});
		
		const	offset = this._radius + 0.1;
		this._position.x += this._direction.x * offset;
		this._position.y += this._direction.y * offset;
		console.log('Position after offset:', {
			x: this._position.x.toFixed(1),
			y: this._position.y.toFixed(1)
		});
	}

	out (players: Player[]) : boolean {
		let	loserIndex: number | null = null;
		let	side: 'right' | 'left' | 'bottom' | 'top' | null = null;

		if (this._coordinates.left > this._ground.width) {
			loserIndex = players.length > 2 ? 0 : null;
			side = 'right';
		}
		else if (this._coordinates.right < 0) {
			loserIndex = players.length > 2 ? 1 : null;
			side = 'left';
		}
		else if (this._coordinates.top > this._ground.height) {
			loserIndex = 2;
			side = 'bottom';
		}
		else if (this._coordinates.bottom < 0) {
			loserIndex = 3;
			side = 'top';
		}

		if (side !== null) {
			if (loserIndex !== null) {
				if (this._lastHit === null || this._lastHit.location === loserIndex)	{ players[loserIndex].losePoint(); }
				else	{ this._lastHit?.score(); }
			}
			else {
				const	winnerIndex = side === 'right' ? 1 : 0;
				players[winnerIndex].score();
			}
			this._rebound = false;
			this._lastHit = null;
			return true ;
		}
		return false ;
	}

	update (players: Player[]) {
		let	speed = this._speed;
		if (!this._rebound)	{ speed /= 2; }

		for (let i = 0; i < speed; i++) {
			this._position.x += this._direction.x;
			this._position.y += this._direction.y;
			for (const player of players) {
				if (player.paddle?.collision(this)) { this.setCoordinates(); break ; }
			}
		}
		this.setCoordinates();
	}

	/* ---------- glossy draw ---------- */
	draw() {
		const ctx = this._ground.field;
		const r   = this._radius;
		const x   = this._position.x;
		const y   = this._position.y;

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

	setCoordinates () {
		this._coordinates.top    = this._position.y - this._radius;
		this._coordinates.bottom = this._position.y + this._radius;
		this._coordinates.left   = this._position.x - this._radius;
		this._coordinates.right  = this._position.x + this._radius;
	}
}
