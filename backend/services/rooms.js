const Room = require('../models/room');
const { handleResponse } = require('../utils/utils');
const API_CODES = require('../utils/apiCodes');

const listRooms = async (req, res) => {
	try {
		await Room.getAvailable((err, rooms) => {
			return handleResponse(req, res, 200, null, rooms, 'Success')
		});
		
	}
	catch (err) {
		return handleResponse(req, res, 500,
            API_CODES.ERROR_ROOM_FAILURE,
            null, 'Error while reading room list'
        );
	}
}

module.exports = {
	listRooms: listRooms,
}
