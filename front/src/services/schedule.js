import api from './api.js';

export const getListRoom = async () => {
	try {
		return await api.get('/schedule/');
	}
	catch (error) {
		return {
				error: true,
				response: error.response
			};
	}
};