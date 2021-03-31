const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: [3, '{PATH} less than 3 characters'],
        max: 255,
        required: [true, '{PATH} is required'],
		unique: true
    },
    number: {
        type: Number,
        min: [1, '{PATH} less than minimum alowed value 1'],
        required: [true, '{PATH} is required'],
		unique: true,
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE','CLOSED'],
            message: '{PATH} is not valid enum value',
        },
        default: 'CLOSED',
    }
});

module.exports = mongoose.model('Room', roomSchema)
