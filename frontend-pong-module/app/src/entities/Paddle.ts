import { Object } from "./Object.ts";
import { Ball } from "./Ball.ts";
import { Player } from "./Player.ts";
import * as Design from "./Design";

export class Paddle extends Object {
	private readonly _width  = 20;
	private readonly _height = 120;
	private readonly _speed  = 3;

	private readonly _bot: boolean;
	private _moveUp   = false;
	private _moveDown = false;

	private readonly _location: number;

	private _x!: number;
	private _y!: number;

	private _top!: number;
	private _bottom!: number;
	private _left!: number;
	private _right!: number;

	constructor(canvas: HTMLCanvasElement, location: number, bot: string) {
		super(canvas);

		this._location = location;
		this._y = this._fieldHeight / 2 - this._height / 2;
		this._x = location === 0
			? this._fieldWidth - 5 - this._width   // right side
			: 5;                                   // left side

		this._bot = bot === "bot";

		this._top    = this._y;
		this._bottom = this._y + this._height;
		this._left   = this._x;
		this._right  = this._x + this._width;

		if (!this._bot) this.eventListener();
	}

	/* ---------- immutable props (values unchanged) ---------- */
	get width()  { return this._width;  }
	get height() { return this._height; }
	get speed()  { return this._speed;  }
	get bot()    { return this._bot;    }
	get x()      { return this._x;      }
	get y()      { return this._y;      }
	get top()    { return this._top;    }
	get bottom() { return this._bottom; }
	get left()   { return this._left;   }
	get right()  { return this._right;  }

	/* ---------- main API ---------- */
	move(player: Player, ball: Ball) {
		if (player.role === "bot") this.followBall(ball);
		this.update();
		this.draw();
	}

	collision(ball: Ball) {
		if (
			ball.x + ball.radius >= this._left  &&
			ball.x - ball.radius <= this._right &&
			ball.y + ball.radius >= this._top   &&
			ball.y - ball.radius <= this._bottom
		) {
			ball.bounce(this);
			return true;
		}
		return false;
	}

	/* ---------- internal ---------- */
	private followBall(ball: Ball) {
		if (this._y + this._height / 2 > ball.y) {
			this._moveUp   = true;
			this._moveDown = false;
		} else {
			this._moveUp   = false;
			this._moveDown = true;
		}
	}

	/** DESIGN‑ONLY CHANGE: use rounded‑rect helper */
	private draw() {
		Design.drawPaddle(
			this._field,
			this._x,
			this._y,
			this._width,
			this._height
		);
	}

	private update() {
		if (this._moveUp   && this._top    > 0)               this._y -= this._speed;
		if (this._moveDown && this._bottom < this._fieldHeight) this._y += this._speed;

		this._top    = this._y;
		this._bottom = this._y + this._height;
	}

	private eventListener() {
		const upKey   = this._location === 0 ? "ArrowUp" : "s";
		const downKey = this._location === 0 ? "ArrowDown" : "x";

		document.addEventListener("keydown", e => {
			if (e.key === upKey)   this._moveUp   = true;
			if (e.key === downKey) this._moveDown = true;
		});
		document.addEventListener("keyup", e => {
			if (e.key === upKey)   this._moveUp   = false;
			if (e.key === downKey) this._moveDown = false;
		});
	}
}
