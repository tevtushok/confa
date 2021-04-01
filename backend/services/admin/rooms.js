const Room = require('../../models/room');
const { jsonResponse, validateRoomTitle, validateRoomNumber } = require('../../utils/utils');
const API_CODES = require('../../utils/apiCodes');


const listRooms = async (req, res) => {
	try {
		await Room.find({}, (err, rooms) => {
			const ret = {rooms: rooms};
			return jsonResponse(req, res, 200, null, ret, 'Success');
		});
	}
	catch (err) {
		return jsonResponse(req, res, 500,
            API_CODES.ERROR_ADMIN_GET_ROOMS_FAILURE,
            err, 'Error while reading rooms list'
        );
	}
};

const saveRooms = async (req, res) => {
    const reqRoom = req.body.rooms;
    // single item to save
    if (Object !== reqRoom.constructor || !Object.keys(reqRoom).length) {
        return jsonResponse(req, res, 500,
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
        // validate only incoming fields
        const validationRes = validateInputFields(Object.keys(room), room);
        if (true !== validationRes) {
            return jsonResponse(req, res, 400,
                API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT, 
                {fields: validationRes}, 'Fields validation error'
            );
        }
        await Room.findOneAndUpdate({_id: roomId}, room)
        .then(savedRoom => {
            if (savedRoom) {
                return jsonResponse(req, res, 200, API_CODES.SUCCESS, savedRoom,'Saved');
            }
            else {
                return jsonResponse(req, res, 400, API_CODES.ERROR_ADMIN_ROOM_NOT_EXISTS, null,'Room does not exists');
            }
        })
        .catch(err => {
            // mongoose codeName: 'DuplicateKey'
            if (11000 === err.code) {
                const ret = {fields: err.keyValue}
                return jsonResponse(req, res, 400,
                    API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE,
                    {fields: err.keyValue}, 'Duplicate field'
                );
            }
            return jsonResponse(req, res, 400,
                API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE,
                err, 'Error while updating single room item in database'
            );
        });
    }
    // create
    else {
        const validationRes = validateInputFields(Object.keys(reqRoom), reqRoom);
        if (true !== validationRes) {
            return jsonResponse(req, res, 400,
                API_CODES.ERROR_ADMIN_SAVING_ROOMS_INPUT, 
                {fields: validationRes}, 'Fields validation error'
            );
        }

        await Room.create(room)
            .then(savedRoom => {
                return jsonResponse(req, res, 200,
                    API_CODES.SUCCESS, {room: savedRoom}, 'Saved'
                );
            })
            .catch(err => {
                // mongoose codeName: 'DuplicateKey'
                if (11000 === err.code) {
                    return jsonResponse(req, res, 400,
                        API_CODES.ERROR_ADMIN_SAVING_ROOMS_DUPLICATE,
                        {fields: err.keyValue}, 'Duplicate field'
                    );
                }
                return jsonResponse(req, res, 400,
                    API_CODES.ERROR_ADMIN_SAVING_ROOMS_FAILURE, null,
                    'Error while saving single room item in database'
                );
            });
    }
}

const deleteRoom = async (req, res) => {
    id = req.params.id || false;
    if (!id) {
        return jsonResponse(req, res, 400, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Room id is required argument'
        );
    }
    await Room.findOneAndDelete({_id: id })
    .then(room => {
        if (room) {
           return jsonResponse(req, res, 200, API_CODES.SUCCESS, room, 'DELETED'); 
        }
        return jsonResponse(req, res, 400, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Room doens exists'
        );
    })
    .catch(err => {
        console.log(err.code, err.message);
        return jsonResponse(req, res, 500, API_CODES.ERROR_ADMIN_DELETING_ROOMS,
            null, 'Error while deleting room'
        );
    });
}

function validateInputFields(fields, data = false) {
    const fieldNames = 'string' === typeof fields ? [fields] : fields;
    if (Array.isArray(fieldNames)) {
        const errors = {};
        fieldNames.forEach(field => {
            if ('title' === field && !validateRoomTitle(data.title)) {
                errors.title = 'Atleast 3 characaters required';
            }
            if ('number' === field && !validateRoomNumber(data.number)) {
                errors.number = 'Invalid number';
            }
        });
        
        return Object.keys(errors).length ? errors : true;
    }
}

module.exports = {
	listRooms: listRooms,
    saveRooms: saveRooms,
    deleteRoom: deleteRoom,

}
