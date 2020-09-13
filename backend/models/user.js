const mongoose = require('mongoose')
const validator = require('validator');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required : [ true, 'name is required'],
		min: 3,
		max: 255,
		required: true,
	},
	email: {
		type: String,
		required: true,
		min: 6,
		max: 500,
		unique: true,
		dropDups: true,
		trim: true,
        lowercase: true,
        validate: validator.isEmail,
        message: '{VALUE} is not a valid email',
	},
	password: {
		type: String,
		required: true,
		min: 6,
		max: 1024,
		required: true,
		bcrypt: true,
	}
},{
	timestamps: true,
})

userSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('User', userSchema)