import { Position, Size } from "../../types/gameUtils.type";

export class Ball {
	position: Position;
	size: Size;
	velocity: Position; // dx, dy
  
	constructor(initialPosition: Position, size: Size, initialVelocity: Position) {
	  this.position = { ...initialPosition };
	  this.size = { ...size };
	  this.velocity = { ...initialVelocity };
	}
  
	update() {
	  this.position.x += this.velocity.x;
	  this.position.y += this.velocity.y;
	}
  
	reset(position: Position, velocity: Position = this.velocity) {
	  this.position = { ...position };
	  this.velocity = { ...velocity };
	}
	toJSON() {
		return {
			position: this.position,
			size: this.size,
		};
	}
  }