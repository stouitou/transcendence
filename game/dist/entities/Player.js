export class Player {
    /* CONSTRUCTOR */
    constructor(name) {
        this._id = -1;
        this._name = name;
    }
    /* GETTERS */
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    /* SETTERS */
    set id(id) {
        this._id = id;
    }
}
