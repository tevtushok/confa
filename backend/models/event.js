const mongoose = require('mongoose')
const { EventError } = require('../includes/errors/models');
const CODES = require('../includes/codes').MODELS;

const eventSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, '{PATH} is required'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '{PATH} is required'],
    },
    title: {
        type: String,
        minlength: [3, '{PATH} less than 3 characters'],
        required: [true, '{PATH} is required'],
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: {
            values: ['active','closed', 'deleted'],
            message: '{PATH} is not valid enum value',
        },
        default: 'closed',
    },
    date_start: {
        type: Date,
        required: [true, '{PATH} is required'],
    },
    date_end: {
        type: Date,
        required: [true, '{PATH} is required'],
        validate: {
            validator: function(v) {
                return this.date_start ? this.date_start < v : true;
            },
            message: props => `${props.value} should be more than date_start`
        },
    },
});


eventSchema.statics.getEventsBetweenDates = async function (roomId, dateStart, dateEnd, exclude_id = false,  callback) {
    const date_start = new Date(dateStart);
    date_start.setSeconds(0,0);
    const date_end = new Date(dateEnd);
    date_end.setSeconds(0,0);
    const filterArgs = {
        room: roomId,
        status: 'active',
        '$or':
        [
            {
                '$and': [
                    { date_start: {'$gte': dateStart.toISOString()} },
                    { date_start: {'$lt': dateEnd.toISOString()} },
                ]
            },
            {
                '$and': [
                    { date_start: {'$lt': dateStart.toISOString()} },
                    { date_end: {'$gt': dateStart.toISOString()} },
                ]
            },
        ]
    };
    if (exclude_id) {
        filterArgs['_id'] = {'$ne': exclude_id};
        // const explain = await this.find(filterArgs).explain();
        // console.log(explain)
    }
    this.find(filterArgs)
        .populate('user', ['_id', 'name'])
        .exec(function (err, events) {
            if (err) {
                return callback(err)
            }
            return callback(null, events);
        });
};

eventSchema.pre('save', function (next) {
    // sets second and milliseconds to zero to avoid collisions
    const dateStart = new Date(this.date_start);
    dateStart.setSeconds(0,0);
    const dateEnd = new Date(this.date_end);
    dateEnd.setSeconds(0,0);
    this.date_start = dateStart;
    this.date_end = dateEnd;
    mongoose.models.Event.getEventsBetweenDates(this.room, this.date_start, this.date_end, this['_id'], (err, events) => {
        if (err) next(err);
        if (events.length) {
            next(new EventError(CODES.EVENT.CROSS_DATES, 'Date is crossed with other event', events));
        }
        else {
            next();
        }
    });
});

eventSchema.statics.details = function (filter, eventId, callback) {
    Event.findOne(filter).exec(function (err, event) {
        if (err) {
            return callback(err);
            const opts = [
                { path: 'room', model: 'Room', select: ['_id', 'number', 'title'] },
                { path: 'user', model: 'User', select: ['_id', 'name', 'title'] },
            ];
            Event.populate(event, opts, function (err, event) {
                return callback(err);
                return event;
            });
        }
    });
};

eventSchema.statics.getActiveByYmd = function (roomId, ymd, callback) {
    this.find({
        status: 'active',
        date_start: {'$gte': new Date(ymd)},
        date_end: {'$lte': new Date(ymd)},
    })
        .exec(function (err, events) {
            if (err) {
                return callback(err)
            }
            return callback(null, events);
        });
};

module.exports = mongoose.model('Event', eventSchema)
