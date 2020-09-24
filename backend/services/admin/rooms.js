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
		return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_GET_ROOMS_FAILURE, err, 'Error while reading rooms list');
	}
};

const saveRooms = async (req, res) => {
    const reqRoom = req.body.rooms;
    // single item to save
    if (reqRoom instanceof Object) {
        const roomId = reqRoom._id;
        let room = reqRoom;
        if (roomId)
            delete room._id;
        // update
        if (roomId) {
            await Room.findOneAndUpdate({_id: roomId}, room, (err, savedRoom) => {
                if (err) {
                    // codeName: 'DuplicateKey',
                    if (11000 === err.code) {
                        const ret = {fields: err.keyValue}
                        return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE, ret, 'Duplicate field');
                    }
                    return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE, err, 'Error while updating single room item in database');
                }
                return handleResponse(req, res, 200, API_CODES.SUCCESS, savedRoom, 'Saved');
            })
        }
        // create
        else {
            await Room.create(room)
            // return handleResponse(req, res, 200, API_CODES.SUCCESS, savedRoom, 'Saved');
        }
            
    }
    // invalid input params
    else {
        return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE, null, 'Invalid input parameters');
    }
}

const deleteRoom = async (req, res) => {
    try {
        Room.findOneAndDelete({id: req.id }, function (err, docs) {
            if (err){
                return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while deleting room');
            }
            else{
                console.log("Deleted User : ", room);
                return handleResponse(req, res,200 , API_CODES.SUCCESS, room, 'DELETED');
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
