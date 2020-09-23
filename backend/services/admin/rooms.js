const Room = require('../../models/room');
const { handleResponse } = require('../../utils/utils');
const API_CODES = require('../../utils/apiCodes');


const listRooms = async (req, res) => {
	try {
		await Room.find({}, (err, rooms) => {
			const ret = {rooms: rooms};
			return handleResponse(req, res, 200, null, ret, 'Success');
		});
	}
	catch (err) {
		return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_GET_LIST_FAILURE, err, 'Error while reading rooms list');
	}
};

const saveRooms = async (req, res) => {
    try {
			return handleResponse(req, res, 200, null, null, 'Success');
    }
    catch (err) {
        return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_SAVING_LIST_FAILURE, err, 'Error while saving list to database');
    }
}

const deleteRoom = async (req, res) => {
    try {
        Room.findOneAndDelete({id: req.id }, function (err, docs) {
            if (err){
                console.log(err)
                return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while deleting room');
            }
            else{
                console.log("Deleted User : ", room);
                return handleResponse(req, res,200 , API_CODES.SUCCESS, room, 'OK');
            }
        });
    }
    catch (err) {
        return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while deleting room');
    }
}

module.exports = {
	listRooms: listRooms,
    saveRooms: saveRooms,
    deleteRoom: deleteRoom,

}
