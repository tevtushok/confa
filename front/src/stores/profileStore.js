import { makeObservable, observable, action } from 'mobx';
import eventsApi from '../services/eventsApi';

export const RENDER_STATES = {
    INIT: 'INIT',
    COMMON: 'COMMON',
    FAILURE: 'FAILURE',
};

class ProfileStore {
    constructor() {
        makeObservable(this);
    }

    @observable renderState = RENDER_STATES.INIT;
    @observable events = [];

    @action loadProfile(username) {
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
