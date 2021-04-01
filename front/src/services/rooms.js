import api from './api.js';

export const roomList = async () => {
	try {
		return await api.get('/rooms');
	}
	catch (error) {
		return {
				error: true,
				response: error.response
			};
	}
};
