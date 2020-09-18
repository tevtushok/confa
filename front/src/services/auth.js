import api from './api.js';

export const verifyAuthService = async () => {
	try {
		return await api.get('/auth/verify');
	}
	catch (error) {
		return {
				error: true,
				response: error.response
			};
	}
};

export const loginAuthService = async (email, password) => {
	try {
		let res = await api.post('/auth/login', {email: email, password: password});
		return res;
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		};
	}
}

export const logoutAuthService = async () => {
	try {
		let res = await api.post('/auth/logout');
		return res;
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		};
	}
}