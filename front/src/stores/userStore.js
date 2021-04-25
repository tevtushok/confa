import { makeObservable, observable, action } from 'mobx';

class UserStore {
    constructor() {
        makeObservable(this);
    }

    @observable user = undefined;
	@action setUser(u) {
		this.user = u;
	}
    @action unsetUser() {
        this.user = undefined;
    }

	get isLoggedIn() {
		return !!this.user;
	}

    get user() {
        return this.user;
    }

	get isAdmin() {
        return this.user?.isAdmin;
	}

}

export default new UserStore();
