const mongoose = require('mongoose')
const dayjs = require('dayjs');

const eventSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, '{PATH} is required'],
        message: 'iiha',
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
                if (this.date_start) {
                    return this.date_start < v;
                }
                return true;
            },
            message: props => `${props.value} should be more than date_start`
        },
    },
});

eventSchema.pre('save', (next) => {
    // check date_start is less than date_end
    // check date crossing with other event by roomId
    next();
});

eventSchema.statics.getRoomEventsBeetwenDates = function (roomId, date_start, date_end, callback) {
    this.find({
        roomId: roomId,
        status: 'active',
        date_start: {'$gte': date_start},
        date_end: {'$lte': date_end},
    })
    .exec(function (err, events) {
        if (err) {
            return callback(err)
        }
        return callback(null, events);
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
