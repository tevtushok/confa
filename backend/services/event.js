const Event = require('../models/event');
const Room = require('../models/room');
const { jsonResponse, filterRequest } = require('../includes/utils');
const { MODELS, API, SUCCESS, FAILURE } = require('../includes/codes');
const { EventError } = require('../includes/errors/models');
const mongoose = require('mongoose');

module.exports.add = async (req, res) => {
    try {
        const eventData  = filterRequest(req.body, ['room', 'date_start', 'date_end', 'title', 'description']);
        eventData.user = req.user.id; // user from user session
        eventData.status = 'active';
        const newEvent = new Event(eventData);
        const validationErr = newEvent.validateSync();
        if (validationErr) {
            // user is not user form field. so, if user is invalid its server error
            if ('user' in validationErr.errors) {
                return jsonResponse(req, res, 500, API.EVENTS.FAILURE, null, 'Invalid user id');
            }
            return jsonResponse(req, res, 401, API.EVENTS.VALIDATION, validationErr, 'Validation error');
        }
        const room = await Room.findById(newEvent.room);
        if (!room) {
            return jsonResponse(req, res, 401, API.EVENTS.ROOM_NOT_EXISTS, null, 'Room does not exists');
        }
        if (room && room['status'] !== 'active') {
            return jsonResponse(req, res, 401, API.EVENTS.ROOM_NOT_ACTIVE, null, 'Room is not active');
        }

        newEvent.save(async (err, event) => {
            if (err) {
                if (err instanceof EventError && err.code === MODELS.EVENT.CROSS_DATES) {
                    return jsonResponse(req, res, 401, API.EVENTS.CROSS_DATES, {events: err.data}, err.message);
                }
                return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Database error');
            }
            const opts = [
                { path: 'room', model: 'Room', select: ['_id', 'number', 'title'] },
                { path: 'user', model: 'User', select: ['_id', 'name', 'title'] },
            ];
            Event.populate(event, opts, function (err, event) {
                if (err) {
                    return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Database error');
                }
                return jsonResponse(req, res, 201, SUCCESS, {event: event}, 'Event added');
            });
        });
    }
    catch (err) {
        return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Error while add event');
    }
};

module.exports.change = async (req, res) => {
    try {
        const eventData  = filterRequest(req.body, ['room', 'date_start', 'date_end', 'title', 'description']);
        eventData.user = req.user.id; // user from user session
        const eventId = req.params.id;
        if (!eventId) {
            return jsonResponse(req, res, 401,
                API.EVENTS.ID_REQUIRED, null, 'Event id is required');
        }
        if (false === mongoose.Types.ObjectId.isValid(eventId)) {
            return jsonResponse(req, res, 401,
                API.EVENTS.ID_INVALID, null, 'Event id is invalid');
        }
        const dbEvent = await Event.findById(eventId).exec();
        if (!dbEvent) {
            return jsonResponse(req, res, 401,
                API.EVENTS.NOT_EXISTS, null, 'This event does not exists');
        }
        else if (false === dbEvent['user'].equals(req.user.id)) {
            return jsonResponse(req, res, 401,
                API.EVENTS.NOT_BELONG_TO_YOU, null, 'This event does not belong to you');
        }
        const roomId = 'room' in eventData ? eventData.room : dbEvent.room;
        const room = await Room.findById(roomId);
        if (!room) {
            return jsonResponse(req, res, 401, API.EVENTS.ROOM_NOT_EXISTS, null, 'Room does not exists');
        }
        if (room && room['status'] !== 'active') {
            return jsonResponse(req, res, 401, API.EVENTS.ROOM_NOT_ACTIVE, null, 'Room is not active');
        }
        // change mongo doc and start validate
        dbEvent.set(eventData);
        const validationErr = dbEvent.validateSync(null, true);
        if (validationErr) {
            // user is not user form field. so, if user is invalid its server error
            if ('user' in validationErr.errors) {
                return jsonResponse(req, res, 500, API.EVENTS.FAILURE, null, 'Invalid user id');
            }
            return jsonResponse(req, res, 401, API.EVENTS.VALIDATION, validationErr, 'Validation error');
        }
        dbEvent.save((err, event) => {
            if (err) {
                if (err instanceof EventError && err.code === MODELS.EVENT.CROSS_DATES) {
                    return jsonResponse(req, res, 401, API.EVENTS.CROSS_DATES, {events: err.data}, err.message);
                }
                return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Database error on Event update');
            }
            const opts = [
                { path: 'room', model: 'Room', select: ['_id', 'number', 'title'] },
                { path: 'user', model: 'User', select: ['_id', 'name', 'title'] },
            ];
            Event.populate(event, opts, function (err, event) {
                if (err) {
                    return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Database error on Event update');
                }
                return jsonResponse(req, res, 201, SUCCESS, {event: event}, 'Event updated');
            });
        });
    }
    catch (err) {
        return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Error while update event');
    }
}

module.exports.delete = async (req, res) => {
    try {
        const eventId = req.params.id;
        if (!eventId) {
            return jsonResponse(req, res, 400, API.EVENTS.ID_REQUIRED, null, 'Event id is required');
        }
        if (false === mongoose.Types.ObjectId.isValid(eventId)) {
            return jsonResponse(req, res, 400, API.EVENTS.ID_INVALID, null, 'Event id is invalid');
        }
        const dbEvent = await Event.findById(eventId).exec();
        if (!dbEvent) {
            return jsonResponse(req, res, 401,
                API.EVENTS.NOT_EXISTS, null, 'This event does not exists');
        }
        else if (false === dbEvent['user'].equals(req.user.id)) {
            return jsonResponse(req, res, 401,
                API.EVENTS.NOT_BELONG_TO_YOU, null, 'This event does not belong to you');
        }
        else {
            dbEvent.status = 'deleted';
            await dbEvent.save();
            return jsonResponse(req, res, 200, SUCCESS, null, 'Event deleted');
        }
    }
    catch(err) {
        return jsonResponse(req, res, 500, API.EVENTS.FAILURE, err, 'Error while delete event');
    }
};

module.exports.details = async(req, res) => {
    try {
        const eventId = req.params.id;
        if (!eventId) {
            return jsonResponse(req, res, 400, API.EVENTS.ID_REQUIRED, null, 'Event id is required');
        }
        if (false === mongoose.Types.ObjectId.isValid(eventId)) {
            return jsonResponse(req, res, 400, API.EVENTS.ID_INVALID, null, 'Event id is invalid');
        }
        // { _id: eventId, status: 'active' })
        const event = await Event.findOne({ _id: eventId, status: 'active' }).exec();
        const opts = [
            { path: 'room', model: 'Room', select: ['_id', 'number', 'title'] },
            { path: 'user', model: 'User', select: ['_id', 'name', 'title'] },
        ];
        Event.populate(event, opts, function (err, event) {
            if (err) {
                return jsonResponse(req, res, 500, API.EVENTS.DETAILS, err, 'Database error');
            }
            if (!event) {
                return jsonResponse(req, res, 404, API.EVENTS.NOT_EXISTS, null, 'Event not found');
            }
            return jsonResponse(req, res, 200, SUCCESS, {event: event}, 'Event details');
        });
    }
    catch(err) {
        return jsonResponse(req, res, 500, API.EVENTS.DETAILS, err, 'Error while reached event details');
    }


}

module.exports.eventList = async (req, res) => {
    return jsonResponse(req, res, 200, SUCCESS, {events: []}, 'Success');
};

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

