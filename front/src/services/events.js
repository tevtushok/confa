import api from './api.js';

export const eventList = async (ymd, roomsArg) => {
	try {
        let rooms = roomsArg || null
        let params = { date: ymd, rooms: rooms}
		return await api.get('/events/eventList', { params: params })
	}
	catch (error) {
		return {
				error: true,
				response: error.response
			};
	}
};
