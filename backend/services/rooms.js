const Room = require('../models/room');
const { jsonResponse } = require('../includes/utils');
const { SUCCESS, FAILURE, API } = require('../includes/codes');

const listRooms = async (req, res) => {
	try {
		await Room.getAvailable((err, rooms) => {
			return jsonResponse(req, res, 200, null, rooms, 'Success')
		});

	}
	catch (err) {
		return jsonResponse(req, res, 500,
            API.ROOMS.ERROR_ROOM_FAILURE,
            null, 'Error while reading room list'
        );
	}
}

module.exports = {
	listRooms: listRooms,
}
