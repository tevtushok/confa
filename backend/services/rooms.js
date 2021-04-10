const Room = require('../models/room');
const { jsonResponse } = require('../includes/utils');
const { SUCCESS, FAILURE, API } = require('../includes/codes');

module.exports.list = async (req, res) => {
	try {
		Room.getActive((err, rooms) => {
            if (err) {
                return jsonResponse(req, res, 500, FAILURE, null, 'Database error')
            }
            // return jsonResponse(req, res, 400, FAILURE, null, 'Database error')
			return jsonResponse(req, res, 200, null, {rooms: rooms}, 'Success')
		});

	}
	catch (err) {
		return jsonResponse(req, res, 500,
            FAILURE,
            null, 'Error while reading room list'
        );
	}
}
