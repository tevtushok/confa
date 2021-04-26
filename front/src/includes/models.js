class Model {
    assignProps(props) {
        Object.keys(props).forEach(key => {
            this[key] = props[key];
        });
    }
}

export class Room extends Model {
    constructor(room = {}) {
        super();
        this._id = '';
        this.number = '';
        this.assignProps(room);
    }
}

export class User extends Model {
    constructor(user = {}) {
        super();
        this._id = '';
        this.name = '';
        this.email = '';
        this.assignProps(user);
    }
}

export class Event extends Model {
    constructor(event = {}) {
        super();
        this._id =  '';
        this.room = new Room();
        this.user = new User();
        this.title = '';
        this.description = '';
        this.date_start = '';
        this.date_end = '';

        this.assignProps(event);
    }
}

