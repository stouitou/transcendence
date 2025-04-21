export class Alert {
	private readonly _element: HTMLDivElement;

	constructor (message: string) {
		this._element = document.createElement('div');
		this._element.style.position = 'absolute';
		this._element.style.minWidth = '250px';
		this._element.style.top = '50%';
		this._element.style.left = '50%';
		this._element.style.transform = 'translate(-50%, -50%)';
		this._element.style.borderRadius = '5px';
		this._element.style.backgroundColor = 'rgb(255, 0, 0)';
		this._element.style.padding = '10px';
		this._element.style.zIndex = '1000';

		this._element.style.color = 'rgb(0, 0, 0)';
		this._element.style.fontFamily = 'system-ui';
		this._element.style.fontSize = '20px';
		this._element.style.textAlign = 'center';
		this._element.style.lineHeight = '1';
		this._element.style.whiteSpace = 'pre-line';
		this._element.textContent = message;
	}

	get element () {
		return this._element;
	}
}