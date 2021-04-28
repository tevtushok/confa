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
            values: ['active','closed'],
            message: '{PATH} is not valid enum value',
        },
        default: 'closed',
    },
});

roomSchema.statics.getActive = async function (callback) {
	this.find({ status: 'active' })
    .exec((err, rooms) => {
        if (err) return callback(err, null);
        callback(null, rooms);
    });
};

module.exports = mongoose.model('Room', roomSchema)
