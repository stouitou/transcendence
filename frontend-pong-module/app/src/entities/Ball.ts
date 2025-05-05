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

		const	maxAngle = 60 * Math.PI / 180;
		const	angle = impactRatio * maxAngle;

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
	}

	out (players: Player[]) : boolean {
		if (this._coordinates.right < 0 || this._coordinates.left > this._ground.width || this._coordinates.bottom < 0 || this._coordinates.top > this._ground.height) {
			if (this._coordinates.left > this._ground.width) {
				if (this._lastHit === null || this._lastHit.location === 0) {
					players[0].historiqueGame.playerWithMostPointsLost++;
					console.log(players[0].name, "Lost Point");
					players[0].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
				players[0].historiqueGame.mostGoalsConcededPlayer++;
				if (this.firstPointScorer(players)){
					players[0].historiqueGame.firstPointScorer = players[0];
					console.log(players[0].name, "marque le premier point");}
				console.log(players[0].name, "Ce prend 1 point");
			}
			else if (this._coordinates.right < 0) {
				if (this._lastHit === null || this._lastHit.location === 1) {
					players[1].historiqueGame.playerWithMostPointsLost++;
					console.log(players[1].name, "Lost Point");
					players[1].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
				players[1].historiqueGame.mostGoalsConcededPlayer++;
				if (this.firstPointScorer(players)) {
					players[1].historiqueGame.firstPointScorer = players[1];
					console.log(players[0].name, "marque le premier point");}
				console.log(players[1].name, "Ce prend 1 point");
			}
			else if (this._coordinates.top > this._ground.height) {
				if (this._lastHit === null || this._lastHit.location === 2) {
					players[2].historiqueGame.playerWithMostPointsLost++;
					players[2].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
				players[2].historiqueGame.mostGoalsConcededPlayer++;
				if (this.firstPointScorer(players))
					players[2].historiqueGame.firstPointScorer = players[2];
			}
			else if (this._coordinates.bottom < 0) {
				if (this._lastHit === null || this._lastHit.location === 3) {
					players[3].historiqueGame.playerWithMostPointsLost++;
					players[3].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
				players[3].historiqueGame.mostGoalsConcededPlayer++;
				if (this.firstPointScorer(players))
					players[3].historiqueGame.firstPointScorer = players[3];
			}
			this._rebound = false;
			this._lastHit = null;
			return true ;
		}
		return false ;
	}

	firstPointScorer (players: Player[]) {
		let scoreEmpty: boolean = true;

		for (let x: number = 0; players.length > x; x++)
		{
			if (players[x].historiqueGame.firstPointScorer) //verifie si un player a deja etait enregistrer
				return false;
			else if (players[x].points != 0)
				scoreEmpty = false;
			
		}
		return scoreEmpty;
	}

	update () {
		let	speed = this._speed;
		if (!this._rebound)	speed /= 2;

		this._position.x += this._direction.x * speed;
		this._position.y += this._direction.y * speed;

		this._coordinates.top    = this._position.y - this._radius;
		this._coordinates.bottom = this._position.y + this._radius;
		this._coordinates.left   = this._position.x - this._radius;
		this._coordinates.right  = this._position.x + this._radius;
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
}
