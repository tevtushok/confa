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
		return handleResponse(req, res, 500,
            API_CODES.ERROR_ADMIN_GET_ROOMS_FAILURE,
            err, 'Error while reading rooms list'
        );
	}
};

const saveRooms = async (req, res) => {
    const reqRoom = req.body.rooms;
    // single item to save
    if (Object !== reqRoom.constructor || !Object.keys(reqRoom).length) {
        return handleResponse(req, res, 500,
            API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT,
            null, 'Invalid input parameters'
        );
    }
    const roomId = reqRoom._id;
    let room = reqRoom;
    if (roomId)
        delete room._id;
    // update
    if (roomId) {
        await Room.findOneAndUpdate({_id: roomId}, room)
        .then(savedRoom => {
            return handleResponse(req, res, 200, API_CODES.SUCCESS, savedRoom,'Saved');
        })
        .catch(err => {
            // mongoose codeName: 'DuplicateKey'
            if (11000 === err.code) {
                const ret = {fields: err.keyValue}
                return handleResponse(req, res, 400,
                    API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE,
                    {fields: err.keyValue}, 'Duplicate field'
                );
            }
            return handleResponse(req, res, 400,
                API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE,
                err, 'Error while updating single room item in database'
            );
        });
    }
    // create
    else {
        let fields = {};

        if (!reqRoom.title || reqRoom.title.length < 3) {
            fields.title = reqRoom.title;
        }
        if (!reqRoom.number || isNaN(reqRoom.number)) {
            fields.number = reqRoom.number;
        }
        if (Object.keys(fields).length) {
            return handleResponse(req, res, 400,
                API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT, 
                {fields: fields}, 'Error while updating single room item in db'
            );
        }

        await Room.create(room)
            .then(savedRoom => {
                return handleResponse(req, res, 200,
                    API_CODES.SUCCESS, {room: savedRoom}, 'Saved'
                );
            })
            .catch(err => {
                // mongoose codeName: 'DuplicateKey'
                if (11000 === err.code) {
                    return handleResponse(req, res, 400,
                        API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE,
                        {fields: err.keyValue}, 'Duplicate field'
                    );
                }
                return handleResponse(req, res, 400,
                    API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE, null,
                    'Error while saving single room item in database'
                );
            });
    }
}

const deleteRoom = async (req, res) => {
    console.log(req.params);
    id = req.params.id || false;
    if (!id) {
        return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Room id is required argument'
        );
    }
    await Room.findOneAndDelete({_id: id })
    .then(room => {
        if (room) {
           return handleResponse(req, res, 200, API_CODES.SUCCESS, room, 'DELETED'); 
        }
        return handleResponse(req, res, 400, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Room doens exists'
        );
    })
    .catch(err => {
        console.log(err.code, err.message);
        return handleResponse(req, res, 500, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Error while deleting room'
        );
    });
}

module.exports = {
	listRooms: listRooms,
    saveRooms: saveRooms,
    deleteRoom: deleteRoom,

}
