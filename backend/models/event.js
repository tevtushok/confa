const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        min:3,
        max: 255,
        required: [true, 'Event title is required'],
    },
    beginningAt: Date,
    endingAt: Date,
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE'
    }
})

eventSchema.statics.getRoomEventsByInterval = function (roomId, beginningAt, endingAt, callback) {
    this.findOne({
        roomId: roomId,
        status: 'ACTIVE',
        beginningAt: {'$gte': beginningAt},
        endingAt: {'$lte': endingAt},
    })
    .exec(function (err, events) {
        if (err) {
            return callback(err)
        }
        return callback(null, events);
    });
};

module.exports = mongoose.model('Event', eventSchema)