const mongoose = require('mongoose')
const { EventError } = require('../includes/errors/models');

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
            values: ['active','closed'],
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


eventSchema.statics.getEventsBeetwenDates = function (roomId, date_start, date_end, exclude_id = [], findOne = false, callback) {
    const findMethod = findOne === true ? this.findOne : this.find;
    exclude_id = [].concat(exclude_id || []);
    const filterArgs = {
        roomId: roomId,
        status: 'active',
        '$or':
        [
            {
                '$and': [
                    { date_start: {'$gte': start} },
                    { date_start: {'$lt': end} },
                ]
            },
            {
                '$and': [
                    { date_start: {'$lt': start} },
                    { date_end: {'$gt': start} },
                ]
            },
        ]
    };
    if (exclude_id.length) {
        filterArgs.id = {id: {'$nin': exclude_id}};
    }
    findMethod(filterArgs)
        .exec(function (err, events) {
            if (err) {
                return callback(err)
            }
            return callback(null, events);
        });
};

// check for dates crossing with other event by roomId
eventSchema.pre('save', function (next) {
    mongoose.models.Event.getEventsBeetwenDates(this.roomId, this.date_start, this.date_end, this.id, true, (err, events) => {
        if (err) next(err);
        if (events.length)
            next(new EventError(2000, 'Date is crossed with other event'));
        next();
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
