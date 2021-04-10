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

export const add = async (data) => {
	try {
        console.log('/event/add', data);
		return await api.post('/events/add', data);
	}
	catch (error) {
        console.log('/event/add - catch', error);
		return {
				error: true,
				response: error.response
			};
	}
};
