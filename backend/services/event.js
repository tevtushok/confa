const dayjs = require('dayjs');
const Event = require('../models/event');
const Room = require('../models/room');
const { jsonResponse, filterRequest } = require('../utils/utils');
const { SUCCESS, FAILURE, ERRORS } = require('../utils/apiCodes');
const { MODELS: MODELS_ERRORS } = require('../includes/errors/codes');
const { EventError } = require('../includes/errors/models');

const today = dayjs().format('MM-DD-YYYY');

module.exports.add = async (req, res) => {
    try {
        const eventData  = filterRequest(req.body, ['roomId', 'date_start', 'date_end', 'title', 'description']);
        eventData.userId = req.user.id; // userId from user session
        const newEvent = new Event(eventData);
        const validationErr = newEvent.validateSync();
        if (validationErr) {
            // userId is not user form field. so, if userId is invalid its server error
            if ('userId' in validationErr.errors) {
                return jsonResponse(req, res, 500, ERRORS.EVENTS.ADD, null, 'Invalid user id');
            }
            return jsonResponse(req, res, 401, ERRORS.EVENTS.ADD_VALIDATION, validationErr, 'Validation error');
        }
        const room = await Room.findOne({_id: eventData.roomId});
        if (!room) {
            return jsonResponse(req, res, 401, ERRORS.EVENTS.ADD_ROOM_NOT_EXISTS, validationErr, 'Room does not exists');
        }
        if (room && room['status'] !== 'active') {
            return jsonResponse(req, res, 401, ERRORS.EVENTS.ADD_ROOM_NOT_ACTIVE, validationErr, 'Room is not active');
        }
        newEvent.status = 'active';
        newEvent.save((err, event) => {
            if (err) {
                if (err instanceof EventError && err.code === MODELS_ERRORS.EVENT.CROSS_DATES) {
                    return jsonResponse(req, res, 401, ERRORS.EVENTS.ADD_CROSS_DATES, {events: err.data}, err.message);
                }
                return jsonResponse(req, res, 500, ERRORS.EVENTS.ADD, err, 'Database error');
            }
            return jsonResponse(req, res, 201, SUCCESS, event, 'Event added');
        });
    }
    catch (err) {
        return jsonResponse(req, res, 500, ERRORS.EVENTS.ADD, null, 'Error while adding event');
    }
}

// router.get('/listToday', eventService.listToday);
// router.get('/listTomorow', eventService.listTomorow);

// module.exports.listToday = async (req, res) => {
//     try {
//         let dateReq = req.query.date;
//         let roomsReq = req.query.rooms;
//         console.log(req.query);

//         if (Array.isArray(roomsReq) && roomsReq > 0 ) {
//             let rooms = Room.find({status: 'active'})
//             return jsonResponse(req, res, 200, null, roomsReq, 'Success')
//         }
//         else {
//             await Room.getAvailable((err, rooms) => {
//                 const ret = [];
//                 rooms.forEach(room => {
//                     const roomId = room._id;
//                     const roomData = {
//                         room: room,
//                         events: []
//                     }
//                     Event.getEventsBetweenDates(roomId, today, today, events => {
//                         roomData.events = events;
//                     });
//                     ret.push(roomData);
//                 });
//                 return jsonResponse(req, res, 200, null, ret, 'Success');
//             });
//         }
//     }
//     catch (err) {
//         return jsonResponse(req, res, 500,
//             API_CODES.ERROR_SCHEDULE_GET_LIST_ROOM,
//             null, 'Error while reading events list'
//         );
//     }
// };

