const Event = require('../models/event');
const Room = require('../models/room');
const { handleResponse } = require('../utils/utils');
const API_CODES = require('../utils/apiCodes');
const dayjs = require('dayjs');

const today = dayjs().format('MM-DD-YYYY');

const eventList = async (req, res) => {
    try {
        let dateReq = req.query.date;
        let roomsReq = req.query.rooms;
        console.log(req.query);

        if (Array.isArray(roomsReq) && roomsReq > 0 ) {
            let rooms = Room.find({status: 'ACTIVE'})
            return handleResponse(req, res, 200, null, roomsReq, 'Success')
        }
        else {
            await Room.getAvailable((err, rooms) => {
                const ret = [];
                rooms.forEach(room => {
                    const roomId = room._id;
                    const roomData = {
                        room: room,
                        events: []
                    }
                    Event.getRoomEventsBeetwenDates(roomId, today, today, events => {
                        roomData.events = events;
                    });
                    ret.push(roomData);
                });
                return handleResponse(req, res, 200, null, ret, 'Success');
            });
        }
    }
    catch (err) {
        return handleResponse(req, res, 500,
            API_CODES.ERROR_SCHEDULE_GET_LIST_ROOM,
            null, 'Error while reading events list'
        );
    }
};

const addEvent = async (req, res) => {
    // validate room number
    // validate event title, 
}

module.exports = {
    eventList: eventList,
}
