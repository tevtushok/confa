import api from './adminApi.js';

export const getRooms = async () => {
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