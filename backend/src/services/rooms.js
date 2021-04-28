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

module.exports.roomsWithEventsOfDay = async (req, res) => {
    try {
        let startDay = null;
        const date = req.params.date;

        // string has only integers, maybe its unix timestamp?
        if (0 === date.search(/^\d+$/g)) {
            startDay = new Date(Number(date));
        }
        else {
            startDay = new Date(date);
        }
        if (isNaN(startDay.getTime())) { // invalid date returns NaN
            return jsonResponse(req, res, 400, API.FAILURE, null, 'Invalid date');
        }
        const nextDay = new Date(startDay);
        startDay.setHours(0, 0, 0, 0);
        nextDay.setHours(0, 0, 0, 0);
        nextDay.setDate(nextDay.getDate() + 1);
        // console.log(startDay, ':', nextDay);
        Room.aggregate([
            {
                $match: { status: 'active' },
            },
            {
                $lookup: {
                    from: 'events',
                    as: 'events',
                    let: { room_id: '$_id' },
                    pipeline: [
                        {$match: {
                            $expr: {
                                $and: [
                                    { $eq: [ '$room', '$$room_id' ]},
                                    { $eq: [ '$status', 'active' ]},
                                    { $gte: [ '$date_start', startDay] },
                                    { $lt: [ '$date_start', nextDay] },
                                ]
                            },
                        }},
                    ],
                },
            },
        ])
        .exec((err, data) => {
            if (err) {
                return jsonResponse(req, res, 500, FAILURE, API.ROOMS.FAILURE, 'Database error');
            }
            return jsonResponse(req, res, 200, null, {data: data}, 'Success')
        });
    }
    catch (err) {
        return jsonResponse(req, res, 500, FAILURE, API.ROOMS.FAILURE, 'Error while reading data');
    }
}

