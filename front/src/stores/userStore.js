import { observable, action } from 'mobx';

class UserStore {
    constructor() {
        this._user = this.parseLocalStorage();
        console.log(this._user);
        console.log(this._user);
    }

    parseLocalStorage() {
        return JSON.parse(window.localStorage.getItem('user'));
    }

    @observable user = this._user;
	@observable isLoggedIn = false;

	@action setLoggedIn(state = true) {
		this.isLoggedIn = state;
	}

	@action setUser(u) {
		this.user = u;
        window.localStorage.setItem('user', JSON.stringify(u));
		this.isLoggedIn = true;
	}

	@action unsetUser() {
		this.user = {};
        window.localStorage.removeItem('user');
		this.isLoggedIn = false;
	}

	get loggedIn() {
		return this.isLoggedIn;
	}

    get user() {
        return this.user;
    }

    get token() {
        return this.user?.token;
    }

	get isAdmin() {
        return this.user?.isAdmin;
	}

}

export default new UserStore();
