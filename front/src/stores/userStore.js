import { makeObservable, observable, action } from 'mobx';

class UserStore {
    constructor() {
        makeObservable(this);
    }

    @observable user = window.localStorage.getItem('user');
	@observable isLoggedIn = false;
    @observable token = window.localStorage.getItem('token');

	@action setLoggedIn(state = true) {
		this.isLoggedIn = state;
	}

    @action setToken(token) {
        this.token = token;
    }

    @action unsetToken() {
        window.localStorage.removeItem('token');
    }

	@action pullUser(u) {
		this.user = u;
        window.localStorage.setItem('user', JSON.stringify(u));
        if ('token' in u) {
            window.localStorage.setItem('token', u.token);
        }
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

	get isAdmin() {
        return this.user?.isAdmin;
	}

}

export default new UserStore();
