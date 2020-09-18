import { observable, action } from 'mobx';

class userStore {
	@observable isLoggedIn = false;
	@observable user = {};
	@action setLoggedIn() {
		this.isLoggedIn = true;
	}
	@action setUser(u) {
		this.user = u;
		this.isLoggedIn = true;
	}
	@action unsetUser() {
		this.user = undefined;
		this.isLoggedIn = false;
	}

}

export default new userStore();