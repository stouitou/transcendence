
import { Size } from "../Interfaces/Size.interface";
import { Player } from "./Player";
import { Position } from "../Interfaces/Position.interface";

export class Ball {
  position: Position;
  size: Size;
  velocity: Position;
  /* private */ speed: number;
  /* private */ lastHit: Player | null = null;
  lastWallBounce: number|null = null;
  _maxBounceCountRound: number = 0;

  constructor(initialPosition: Position, size: Size, initialVelocity: Position, speed: number = 0.4) {
    this.position = { ...initialPosition };
    this.size = { ...size };
    this.velocity = { ...initialVelocity };
	this.normalize()
    this.speed = speed //@TODO: set speed to ??
	}

  update() {
//	this.speed = 3
    // Déplacer la balle en fonction de sa vitesse et de sa direction
   this.position.x += this.velocity.x * this.speed;
    this.position.y += this.velocity.y * this.speed;
  }
  /**
   * clamp la position de la balle pour qu'elle reste dans le canvas
   * @param canvas 
   */
  /* private */ clampBall(canvas: { width: number; height: number }) {
	this.position.x = Math.max(0, Math.min(this.position.x, canvas.width - this.size.width));
   this.position.y = Math.max(0, Math.min(this.position.y, canvas.height - this.size.height));
  }
	private magnitude = () => Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
	/* private */ normalize = () => {
		const	magnitude = this.magnitude();
		if (magnitude === 0) {
			console.warn('Cannot normalize a zero vector');
			return;
		  }
		this.velocity.x = this.velocity.x / magnitude;
		this.velocity.y = this.velocity.y / magnitude;
	}
  reset(position: Position, velocity: Position = this.velocity) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.lastHit = null;
  }
  /**
   * Réinitialiser le dernier joueur ayant touché la balle
   * Réinitialiser le dernier mur touché
   * Réinitialiser la position de la balle
   */
  resetBall(canvas: { width: number; height: number }) {
	this.lastHit = null;
	this.lastWallBounce = null; 
	this.spawn(canvas);
  }

	spawn (canvas: { width: number; height: number }) {
		const	x = canvas.width  / 2;
		const	y = (33 + (Math.random() * 100) / 3) / 100 * canvas.height;
		this.position = { x: x, y: y };

		const	add = Math.random() * 30;
		let		vx = Math.sin((45 + add) * Math.PI / 180);
		let		vy = Math.cos((45 + add) * Math.PI / 180);
		const	base = Math.random() * 4;
		if (base < 2)				vx *= -1;
		if (base >= 1 && base < 3)	vy *= -1;

		this.velocity = {
			x: vx,
			y: vy
		};
		this.normalize();
	}
}
