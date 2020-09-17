import API from './api.js';

export const verifyAuthService = async () => {
	try {
		return await API.get('/auth/verify');
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		};
	}
}

export const loginAuthService = async (email, password) => {
	try {
		let res = await API.post('/auth/login', {email: email, password: password});
		return res;
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		};
	}
}