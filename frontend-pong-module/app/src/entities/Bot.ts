import { Ball } from "./Ball";
import { Player } from "./Player";
import { Position } from "../Interfaces/Position.interface";

export class	Bot extends Player {

	private readonly	_level: number;
	private				_targetSide: string | null = null;

	constructor (level: number) {
		super({name: null, role: 'bot'});
		this._level = level;
	}

	override move (ball: Ball) {
		switch (this._location) {
			case 0:
			case 1:
				this.followBallVertical(ball);
				break ;
			case 2:
			case 3:
				this.followBallHorizontal(ball);
				break ;
		}
	}

	private followBallHorizontal (ball: Ball) {
		if (!this._paddle)
			return ;
		
		let 	target = this._paddle.coordinates.center.x;
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };

		const	isVertical = Math.abs(ball.direction.x) < 0.2;
		const	isAligned = Math.abs(this._paddle?.coordinates.center.x - ball.position.x) < 8;
 
		if (isVertical && isAligned) {
			if (this._targetSide === null)	{ this._targetSide = Math.random() < 0.5 ? 'right' : 'left'; }
			target = this._targetSide === 'right'
				? this._paddle?.coordinates.center.x + (9 * (this._paddle?.height / 10))
				: this._paddle?.coordinates.center.x + (this._paddle?.height / 10);
		}

		if (target > ballPosition.x) {
			this._direction = 'left';
		}
		else if (target < ballPosition.x) {
			this._direction = 'right';
		}
	}

	private followBallVertical (ball: Ball) {
		if (!this._paddle)
			return ;

		let 	target = this._paddle.coordinates.center.y;
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };

		const	isHorizontal = Math.abs(ball.direction.y) < 0.2;
		const	isAligned = Math.abs(this._paddle?.coordinates.center.y - ball.position.y) < 8;

		if (isHorizontal && isAligned) {
			if (this._targetSide === null)	{ this._targetSide = Math.random() < 0.5 ? 'down' : 'up'; }
			target = this._targetSide === 'down'
				? this._paddle?.coordinates.center.y + (9 * (this._paddle?.height / 10))
				: this._paddle?.coordinates.center.y + (this._paddle?.height / 10);
		}

		if (target > ballPosition.y) { 
			this._direction = 'up';
		}
		else if (target < ballPosition.y) {
			this._direction = 'down';
		}
	}
}