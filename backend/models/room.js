const mongoose = require('mongoose')


const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        min:3,
        max: 255,
        required: [true, 'Room title is required'],
		unique: true
    },
    number: {
        type: Number,
        min: 0,
        message: 'Number is required',
		unique: true,
    },
    status: {
        type: Number,
        // 1 available
        // 0 not available
        default: 1
    }
})

roomSchema.statics.getAvailable = function (cb) {
    this.find({status: 1})
    .exec(function (err, rooms) {
        if ('function' === typeof cb) {
            if (err) {
                return cb(err)
            }
            return cb(null, rooms);
        }
        else throw new Error('Missed callback function')
    });
};

module.exports = mongoose.model('Room', roomSchema)
