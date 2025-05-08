export class	User {

	protected readonly	_name: string;
	protected readonly	_role: string;

	constructor (json: any) {
		this._name = json.name;
		if (!this._name)
			this._name = 'Host';
		this._role = json.role;
		if (!this._role)
				this._role = 'user';
	}

	get name () {
		return this._name;
	}

	get role () {
		return this._role;
	}
}
