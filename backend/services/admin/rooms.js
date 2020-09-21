const Room = require('../../models/room');
const { handleResponse } = require('../../utils/utils');
const API_CODES = require('../../utils/apiCodes');
const list = async (req, res) => {
	console.log(req.user);
	try {
		await Room.find({}, (err, rooms) => {
			const ret = {rooms: rooms};
			return handleResponse(req, res, 200, null, ret, 'Success');
		});
	}
	catch (err) {
		return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while reading rooms list');
	}
};

module.exports = {
	list: list,
}