const Event = require('../models/event');
const Room = require('../models/room');
const { handleResponse } = require('../utils/utils');
const API_CODES = require('../utils/apiCodes');
const dayjs = require('dayjs');

const today = dayjs().format('MM-DD-YYYY');

const listRooms = async (req, res) => {
	try {
		await Room.getAvailable((err, rooms) => {
			const ret = [];
			rooms.forEach(room => {
				const roomId = room._id;
				const roomData = {
					room: room,
					events: []
				}
				Event.getRoomEventsByInterval(roomId, today, today, events => {
					roomData.events = events;
				});
				ret.push(roomData);
			});
			return handleResponse(req, res, 200, null, ret, 'Success');
		});
	}
	catch (err) {
		console.log('error in services/schedule:listRooms')
		console.error(err);
		return handleResponse(req, res, 500,
            API_CODES.ERROR_SCHEDULE_GET_LIST_ROOM,
            null, 'Error while reading events list'
        );
	}
};

module.exports = {
	listRooms: listRooms,
}