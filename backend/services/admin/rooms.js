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
    if (reqRoom instanceof Object && Object.keys(reqRoom).length) {
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
            let fields = {};

            if (!reqRoom.title || reqRoom.title.length < 3) {
                fields.title = reqRoom.title;
            }
            console.log(typeof reqRoom.number)
            if (!reqRoom.number || isNaN(reqRoom.number)) {
                fields.number = reqRoom.number;
            }
            if (Object.keys(fields).length) {
                return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT, {fields: fields}, 'Error while updating single room item in database');
            }
            console.log('----------------------------')
            console.log(fields);
            console.log(reqRoom.title.length);
            console.log('----------------------------')
            await Room.create(room, (err, savedRoom) => {
                if (err) {
                    // codeName: 'DuplicateKey',
                    if (11000 === err.code) {
                        const ret = {fields: err.keyValue}
                        return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE, ret, 'Duplicate field');
                    }
                    return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE, err, 'Error while saving single room item in database');
                }
                return handleResponse(req, res, 200, API_CODES.SUCCESS, {room: savedRoom}, 'Saved');
            })
        }
            
    }
    // invalid input params
    else {
        return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT, null, 'Invalid input parameters');
    }
}

const deleteRoom = async (req, res) => {
    try {
        Room.findOneAndDelete({id: req.id }, function (err, room) {
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
