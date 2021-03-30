const mongoose = require('mongoose')


const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        min:3,
        max: 255,
        required: [true, '{PATH} is required'],
		unique: true
    },
    number: {
        type: Number,
        min: 1,
        message: 'Number is required',
		unique: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE','CLOSED'],
        default: 'CLOSED'
    }
})

roomSchema.statics.getAvailable = function (cb) {
    this.find({status: 'ACTIVE'})
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
