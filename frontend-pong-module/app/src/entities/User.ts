export class	User {

	protected readonly	_name: string;
	protected readonly	_role: string;

	constructor (json: any) {
		this._name = json.name;
		this._role = json.role;
	}

	get name () {
		return this._name;
	}

	get role () {
		return this._role;
	}
}