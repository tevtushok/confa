const mongoose = require('mongoose')
const { EventError } = require('../includes/errors/models');
const CODES = require('../includes/codes').MODELS;

const eventSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, '{PATH} is required'],
    },
    userId: {
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
        required: [true, '{PATH} is required'],
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
    const filterArgs = {
        roomId: roomId,
        status: 'active',
        '$or':
        [
            {
                '$and': [
                    { date_start: {'$gte': dateStart} },
                    { date_start: {'$lt': dateEnd} },
                ]
            },
            {
                '$and': [
                    { date_start: {'$lt': dateStart} },
                    { date_end: {'$gt': dateStart} },
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
        .exec(function (err, events) {
            if (err) {
                return callback(err)
            }
            return callback(null, events);
        });
};

// check for dates crossing with other event by roomId
eventSchema.pre('save', function (next) {
    mongoose.models.Event.getEventsBetweenDates(this.roomId, this.date_start, this.date_end, this['_id'], (err, events) => {
        if (err) next(err);
        if (events.length) {
            next(new EventError(CODES.EVENT.CROSS_DATES, 'Date is crossed with other event', events));
        }
        else {
            next();
        }
    });
});

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
