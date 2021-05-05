import { makeObservable, observable, action } from 'mobx';

export const RENDER_STATES = {
    'LOADER': 'LOADER',
    'OFFLINE': 'OFFLINE',
    'ERROR': 'ERROR',
    'COMMON': 'COMMON',
};


class AppStore {
    constructor() {
        window.addEventListener('online', () => {
            console.log('this.isOnline: true');
            this.isOnline = true;
        });
        window.addEventListener('offline', () => {
            console.log('this.isOnline: false');
            this.isOnline = false;
        });
        makeObservable(this);
    }
    @observable isOnline = window.navigator.onLine

    @observable darkMode = !!window.localStorage.getItem('darkMode');
    @action setDarkMode(flag = true) {
        this.darkMode = flag;
        window.localStorage.setItem('darkMode', flag);
    }

    @observable token = window.localStorage.getItem('token');
    @action setToken(token) {
        this.token = token;
        window.localStorage.setItem('token', token);
    }

    @action unsetToken() {
        this.token = undefined;
        window.localStorage.removeItem('token');
    }

    @observable renderState = RENDER_STATES.LOADER;
    @action setRenderState(value) {
        this.renderState = value;
    }

    @observable errorMessage = '';
    @action setErrorMessage(message) {
        this.errorMessage= message;
    }
    getErrorMessage() {
        return this.errorMessage;
    }
}

export default new AppStore();
