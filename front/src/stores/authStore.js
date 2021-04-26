import { makeObservable, observable, action } from 'mobx';
import appStore from './appStore';
import userStore from './userStore';
import authApi from '../services/authApi';
import CODES from '../services/codes'
import { validateEmail, validatePassword } from '../includes/validators';


export const RENDER_STATES = {
    COMMON: 'COMMON',
    FAILURE: 'FAILURE',
};

class authStore{
    constructor() {
        makeObservable(this);
    }

    @observable values = {
        email: 'a5q@uskr.nex',
        password: 'test123',
    }

    @action reset() {
        this.values.email = '';
        this.values.password = '';
        this.serviceMessage = '';
        this.errors = {}
    }

    @action setEmail(email) {
        this.values.email = email;
        const validate = validateEmail(email);
        true === validate ? delete this.errors.email : this.errors.email = validate;
    }

    @action setPassword(password) {
        this.values.password = password;
        const validate = validatePassword(password);
        true === validate ? delete this.errors.password: this.errors.password = validate;
    }

    @observable renderState = RENDER_STATES.COMMON;
    @observable errors = {};
    @observable serviceMessage = '';
    @observable inProgress = false;

    @action login() {
        this.inProgress = true;
        this.serviceMessage = '';
        return authApi.login(this.values.email, this.values.password)
            .then(action(({ response }) => {
                const apiData = response.getApiData();
                userStore.setUser(apiData.user);
                appStore.setToken(apiData.user.token);
            }))
            .catch(action(({ errors, response }) => {
                const apiMessage = response.getApiMessage();
                const apiCode = response.getApiCode();
                this.renderState = RENDER_STATES.FAILURE;
                switch(apiCode) {
                    case CODES.AUTH.INVALID_CREDENTIALS:
                    case CODES.AUTH.EMPTY_CREDENTIALS:
                        this.serviceMessage = 'Invalid credentials';
                        break;
                    default:
                        console.log('authStore login default case', apiMessage);
                        this.serviceMessage = 'Server error';
                }
            }))
            .finally(action(() => {
                this.inProgress = false;
            }));
    }
}

export default new authStore();
