import { observable, action } from 'mobx';

class CommonStore {
	@observable appLoaded = false;
	@action setAppLoaded() {
		this.appLoaded = true;
	}
	
	@observable defServerError = false;
	@action setServerError(message) {
		this.serverError = message;
	}
	getServerError() {
		return this.defServerError;
	}

}

export default new CommonStore();