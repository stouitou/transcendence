import { Position, Size } from "../../types/gameUtils.type";

export class Paddle {
	position: Position;
	size: Size;

	constructor(initialPosition: Position, size: Size) {
		this.position = { ...initialPosition };
		this.size = { ...size };
	}

	clamp(canvas:{ width: number, height: number }) {
		if (this.position.x < 0) this.position.x = 0;
		if (this.position.y < 0) this.position.y = 0;
		if (this.position.x + this.size.width > canvas.width)
			this.position.x = canvas.width - this.size.width;
		if (this.position.y + this.size.height > canvas.height)
			this.position.y = canvas.height - this.size.height;
	}
	move(dx: number, dy: number) {
		this.position.x += dx;
		this.position.y += dy;
		this.clamp({ width: 800, height: 600 });
	}
	setPosition(position: Position) {
		const canvas = { width: 800, height: 600 };
		this.position = { ...position };
		this.clamp(canvas);
	}

	toJSON() {
		return {
			position: this.position,
			size: this.size,
		};
	}
}