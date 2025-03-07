export class Player {
	private readonly _name: string;
	private _id: number = -1;

	/* CONSTRUCTOR */
	public constructor (name: string) {
		this._name = name;
	}

	/* GETTERS */
	public get name () {
		return this._name;
	}

	public get id () {
		return this._id;
	}

	/* SETTERS */
	public set id (id: number) {
		this._id = id;
	}
}
