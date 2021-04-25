import { makeObservable, observable, action } from 'mobx';

import { RENDERED_PAGES } from '../includes/app';


class AppStore {
    constructor() {
        makeObservable(this);
    }
    @observable appLoaded = false;
    @action setAppLoaded(flag = true) {
        this.appLoaded = flag;
    }

    @observable page = RENDERED_PAGES.LOADER;
    @action setPage(pageCode) {
        this.page = pageCode;
    }

    @observable errorMessage = '';
    @action setErrorMessage(message) {
        this.errorMessage= message;
    }
    getErrorMessage() {
        return this.errorMessage;
    }

    isOnLine() {
        return window.navigator.onLine;
    }
}

export default new AppStore();
