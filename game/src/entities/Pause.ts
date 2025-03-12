export class	Pause {

	private readonly	_element: HTMLDivElement;

	/* CONSTRUCTOR */
	constructor () {
		this._element = document.createElement('div');
		this._element.textContent = "pause";
		this._element.style.font = 'system-ui';
		this._element.style.color = 'rgb(255, 0, 0)';
		this._element.style.fontSize = '80px';
		this._element.style.top = "5%";
		this._element.style.left = "50%";
		this._element.style.position = "absolute";
		this._element.style.transform = "translate(-50%, -50%)";
		this._element.style.display = "none";
		document.body.appendChild(this._element);
	}

	public get element () {
		return this._element ;
	}
}