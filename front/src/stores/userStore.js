import { observable, action } from 'mobx';

class userStore {
	@observable isLoggedIn = false;
	@action setLoggedIn() {
		this.isLoggedIn = true;
	}

}

export default new userStore();