import { Position } from "../Interfaces/Position.interface";
import { Ball } from "./Ball";
import { Player } from "./Player";

export class	Bot extends Player {

	private				_level: number;

	constructor (level: number) {
		super({name: 'Bot', role: 'bot'});
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

		const	ballPosition: Position = { x: ball.position.x, y: ball.position.y };
		switch (this._level) {
			case 1:
			case 2:
			case 3:
		}

		if (this._level )
		if (this._paddle.position.x + (this._paddle.height / 2) > ballPosition.x) {
			this._direction = 'left';
		}
		else if (this._paddle.position.x + (this._paddle.height / 2) < ballPosition.x) {
			this._direction = 'right';
		}
	}

	private followBallVertical (ball: Ball) {
		if (!this._paddle)
			return ;

		if (this._paddle.position.y + (this._paddle.height / 2) > ball.position.y) {
			this._direction = 'up';
		}
		else if (this._paddle.position.y + (this._paddle.height / 2) < ball.position.y) {
			this._direction = 'down';
		}
	}
}