import { Ball } from './Ball';
import { Player } from "./Player";
import { Position } from "../Interfaces/Position.interface";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../component/classic";

export class	Bot {

	private readonly	_player: Player;
	private readonly	_level: number;
	//private				_targetSide: string | null = null;
	private readonly	_tolerance: number = 20;	// tolerance to avoid vibrations

	constructor (level: number, player: Player) {
		this._player = player;
		this._level = level;
	}

	move (ball: Ball) {
		switch (this._player.location) {
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
		if (!this._player.paddle)	{ return ; }
	
		const	{ paddle } = this._player;
		const	target = paddle.position.x + paddle.size.width / 2;			// middle of the paddle
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);	// noise depending on the bot level
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
	
		// Go back to the center of the canvas if ball go away
		if (
			ball.velocity.y < 0 && this._player.location === 2 ||
			ball.velocity.y > 0 && this._player.location === 3
		) {
			this.repositionToCenterHorizontal();
			return ;
		}
	
		// Check if the bot needs to move
		if (Math.abs(target - ballPosition.x) > this._tolerance) {
			if (target > ballPosition.x) {
				this._player.inputManager.directionReceived = "left";
			} else if (target < ballPosition.x) {
				this._player.inputManager.directionReceived = "right";
			}
		} else {
			// Stop movement if possition is ok
			this._player.inputManager?.clearDirection();
		}
	}
	
	private followBallVertical (ball: Ball) {
		if (!this._player.paddle)	{ return ; }
	
		const	{ paddle } = this._player;
		const	target = paddle.position.y + paddle.size.height / 2;		// middle of the paddle
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);	// noise depending on the bot level
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
	
		// Go back to the center of the canvas if ball go away
		if (
			ball.velocity.x < 0 && this._player.location === 0 ||
			ball.velocity.x > 0 && this._player.location === 1
		) {
			this.repositionToCenterVertical();
			return;
		}
	
		// Check if the bot needs to move
		if (Math.abs(target - ballPosition.y) > this._tolerance) {
			if (target > ballPosition.y) {
				this._player.inputManager.directionReceived = "up";
			} else if (target < ballPosition.y) {
				this._player.inputManager.directionReceived = "down";
			}
		} else {
			// Stop movement if possition is ok
			this._player.inputManager?.clearDirection();
		}
	}
	
	private repositionToCenterHorizontal () {
		if (!this._player.paddle)	{ return ; }

		const	{ paddle } = this._player;
		const	center = CANVAS_WIDTH / 2;
		const	target = paddle.position.x + paddle.size.width / 2;
	
		if (Math.abs(target - center) > this._tolerance) {
			if (target > center) {
				this._player.inputManager.directionReceived = "left";
			} else if (target < center) {
				this._player.inputManager.directionReceived = "right";
			}
		} else {
			this._player.inputManager?.clearDirection();
		}
	}
	
	private repositionToCenterVertical () {
		if (!this._player.paddle)	{ return; }

		const	{ paddle } = this._player;
		const	center = CANVAS_HEIGHT / 2;
		const	target = paddle.position.y + paddle.size.height / 2;
	
		if (Math.abs(target - center) > this._tolerance) {
			if (target > center) {
				this._player.inputManager.directionReceived = "up";
			} else if (target < center) {
				this._player.inputManager.directionReceived = "down";
			}
		} else {
			this._player.inputManager?.clearDirection();
		}
	}
}