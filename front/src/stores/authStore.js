import { makeObservable, observable, action } from 'mobx';
import appStore from './appStore';
import userStore from './userStore';
import authApi from '../services/authApi';
import CODES from '../services/codes'
import { validateEmail, validateName, validatePassword } from '../includes/validators';


export const RENDER_STATES = {
    COMMON: 'COMMON',
    FAILURE: 'FAILURE',
};

class authStore{
    constructor() {
        makeObservable(this);
    }

    @observable values = {
        email: '',
        password: '',
        name: '',
        password_confirm: '',
    }

    @action reset() {
        this.values.name = '';
        this.values.email = '';
        this.values.password = '';
        this.values.password_confirm = '';
        this.serviceMessage = '';
        this.errors = {}
    }

    @action setName(name) {
        this.values.name = name;
        const validate = validateName(name);
        console.log('name', validate);
        true === validate ? delete this.errors.name: this.errors.name = validate;
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

    @action setPasswordConfirm(password_confirm) {
        this.values.password_confirm = password_confirm;
        console.log(this.values.password, this.values.password_confirm);
        const validate = this.values.password === this.values.password_confirm;
        true === validate ?  delete this.errors.password_confirm
            : this.errors.password_confirm = { message: 'Passwords dismatched' };
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
            .catch(action(({ error, response }) => {
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

    @action register() {
        this.inProgress = false;
        const data = {
            name: this.values.name,
            email: this.values.email,
            password: this.values.password,
        }
        return authApi.register(data)
            .then(action(({ response }) => {
                const apiData = response.getApiData();
                userStore.setUser(apiData.user);
                appStore.setToken(apiData.user.token);
            }))
            .catch(action(({ error, response }) => {
                const apiMessage = response.getApiMessage();
                const apiCode = response.getApiCode();
                const apiData = response.getApiData();
                console.log('register catch', apiCode, apiMessage);
                switch(apiCode) {
                    case CODES.AUTH.VALIDATION:
                        this.errors = apiData.errors;
                        break;
                    case CODES.AUTH.EMAIL_EXISTS:
                        this.errors = {email: { message: 'Email exists' }};
                        break;
                    default:
                        this.serviceMessage = 'Server error';
                }
                throw error;
            }))
            .finally(action(() => {
                this.inProgress = false;
            }));
    }
}
export default new authStore();
