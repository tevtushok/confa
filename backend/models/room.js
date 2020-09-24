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

module.exports = mongoose.model('Room', roomSchema)
