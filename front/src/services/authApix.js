import Api from './apix';

class AuthApi extends Api {
    verify() {
        return this.axios.get('/auth/verify');
    }

    login(email, password) {
        return this.axios.post('/auth/login', {email: email, password: password});
    }

    logout() {
        return this.axios.post('/auth/logout');
    }

    register(user) {
        return this.axios.post('/auth/register', user);
    }
}

export default new AuthApi();
