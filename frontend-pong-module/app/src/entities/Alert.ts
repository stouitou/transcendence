export class Alert {
	private readonly _element: HTMLDivElement;

	constructor (message: string) {
		this._element = document.createElement('div');

		Object.assign(this._element.style, {
			position: 'absolute',
			minWidth: '150px',
			maxWidth: '250px',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			borderRadius: '5px',
			backgroundColor: 'rgba(255, 0, 0, 0.9)',
			padding: '8px',
			zIndex: '1000',
			color: 'black',
			fontFamily: 'system-ui',
			fontSize: '25px',
			textAlign: 'center',
			lineHeight: '0.8',
			whiteSpace: 'pre-line',
			overflowWrap: 'break-word',
		});
		this._element.textContent = message;
	}

	get element () {
		return this._element;
	}
}