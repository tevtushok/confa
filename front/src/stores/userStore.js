import { observable, action } from 'mobx';

class userStore {
	@observable isLoggedIn = false;
	@observable user = {};
	@action setLoggedIn(state) {
		this.isLoggedIn = state;
	}
	@action setUser(u) {
		this.user = u;
		this.isLoggedIn = true;
	}
	@action unsetUser() {
		this.user = undefined;
		this.isLoggedIn = false;
	}

	get LoggedIn() {
		return this.isLoggedIn;
	}
	set LoggedIn(state) {
		this.setLoggedIn(state);
	}
    get user() {
        return this.user;
    }
	get userRole() {
		if (this.user && this.user.role) {
			return this.user.role;
		}
		return undefined;
	}

}

export default new userStore();
