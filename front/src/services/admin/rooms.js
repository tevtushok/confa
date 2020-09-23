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
}

export const saveRooms = async (rooms) => {
	try {
		return await api.post('/rooms');
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		}
	}
}

export const deleteRoom = async (id) => {
	try {
		console.log('axios deleteRoom')
		return await api.delete('/rooms', {id: id});
	}
	catch (error) {
		return {
			error: true,
			response: error.response
		}
	}
}