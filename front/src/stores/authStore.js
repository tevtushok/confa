import { makeObservable, observable, action } from 'mobx';
import authApi from '../services/authApi';

export const RENDER_STATES = {
    INIT: 'INIT',
    COMMON: 'COMMON',
    FAILURE: 'FAILURE',
};

class authStore{
    constructor() {
        makeObservable(this);
    }

    @observable values = {
        'name': '',
        'email': '',
        'password': '',
        'password_comfirm': '',
    }

    @observable renderState = RENDER_STATES.INIT;

    @action login(email, password) {
        this.renderState = RENDER_STATES.INIT;
        eventsApi.getMyEvents()
            .then(action(({ response }) => {
                const apiData = response.getApiData();
                this.renderState = RENDER_STATES.COMMON;
                this.events = apiData.events;
            }))
            .catch(action(( {error, response }) => {
                this.events = [];
                this.renderState = RENDER_STATES.FAILURE;
            }));
    }
}

export default new ProfileStore();
