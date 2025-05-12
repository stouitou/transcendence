type localMapping = Record<string, { dx: number;dy: number;direction: string }>;
const localMappings: localMapping[] =
	   [
		{
		  ArrowUp: { dx: 0, dy: -5, direction:"up"},// up
		  ArrowDown: { dx: 0, dy: 5, direction:"down" },// down
		},
		{
		  z: { dx: 0, dy: -5, direction:"up"},// up
		  s: { dx: 0, dy: 5, direction:"down" },// down
		},
		{
		  ArrowLeft: { dx: -5, dy: 0 , direction:"left" },// left
		  ArrowRight: { dx: 5, dy: 0 , direction:"right" },// right
		},
]
const localBindMappings  =  {
	up: { dx: 0, dy: -5},// up
	down: { dx: 0, dy: 5},// down
	left: { dx: -5, dy: 0 },// left
	right: { dx: 5, dy: 0 },// right
  }
  export class InputManager {
	playerIndex: number;
	keysPressed = new Set<string>();
	directionReceived = new Set<string>();
	controlMapping: Record<string, { dx: number; dy: number,direction:string}> = {};
	controlBindMapping: Record<string, { dx: number; dy: number}> = {};
	eventListeners: {key:string, handler:(event: Event) => void}[] = [
		{
			key: 'keydown',handler: (event:Event) => {this.keysPressed.add((event as KeyboardEvent).key);},
		},
		{
			key: 'keyup', handler: (event:Event) => {this.keysPressed.delete((event as KeyboardEvent).key);},
		}

	]
  
	constructor(playerIndex: number = 0,private isActive:boolean = false) {
		this.playerIndex = playerIndex;
		this.setMapping(localMappings[playerIndex]);
		this.setBindMapping(localBindMappings);
		if(this.isActive){
			window.addEventListener('keydown', (e) => {this.keysPressed.add(e.key);});
			window.addEventListener('keyup', (e) => this.keysPressed.delete(e.key));
		}
	}
	removeEventListeners() {
		if (!this.isActive) return;
		for (const listener of this.eventListeners) {
			window.removeEventListener(listener.key, listener.handler);
		}
	}
	getEventListeners() {
		return this.eventListeners;
	}

  
	//lier les touches de direction arrowUp, arrowDown, arrowLeft, arrowRight ...
	setMapping(mapping: Record<string, { dx: number; dy: number,direction:string }>) {
	  this.controlMapping = mapping;
	//  console.log('Control mapping set:', this.controlMapping['ArrowUp']);
	}
	//lier les actions de direction up, down, left, right 
	setBindMapping(mapping: Record<string, { dx: number; dy: number }>) {
		this.controlBindMapping = mapping;
	  //  console.log('Control mapping set:', this.controlMapping['ArrowUp']);
	  }
  
	getMovement(): { dx: number; dy: number, direction:string } {
	  let dx = 0;
	  let dy = 0;
	  let direction = '';
	  for (const key of this.keysPressed) {
		if (this.controlMapping[key]) {
		  dx += this.controlMapping[key].dx;
		  dy += this.controlMapping[key].dy;
		  direction = this.controlMapping[key].direction;
		}
	  }
	  return { dx, dy , direction};
	}
	getDirectionMovement():{ dx: number; dy: number, direction:string } {
		let dx = 0;
		let dy = 0;
		let direction = '';
		for (const key of this.keysPressed) {
		  if (this.controlMapping[key]) {
			direction = this.controlMapping[key].direction;
			dx += this.controlBindMapping[direction].dx;
			dy += this.controlBindMapping[direction].dy;
		  }
		}
		return { dx, dy , direction};
	}

	setDirection(direction: string) {
		this.directionReceived.add(direction);
	}
	clearDirection() {
		this.directionReceived.clear();
	}
	getMovementByDirection() {
		let dx = 0;
		let dy = 0;
		for (const direction of this.directionReceived) {
		  if (this.controlBindMapping[direction]) {
			dx += this.controlBindMapping[direction].dx;
			dy += this.controlBindMapping[direction].dy;
		  }
		}
		return { dx, dy };
	  }
  }