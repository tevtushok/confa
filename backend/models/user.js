const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
	},
    // role = 1 regular
    // role = 2 admin
    role: {
        type: Number,
        required: true,
        default: 1,

    }
},{
	timestamps: true,
})

// check authenticate by email and password
userSchema.statics.authenticate = function (email, password, callback) {
	this.findOne({ email: email })
	.exec(function (err, user) {
		if (err) {
			return callback(err)
		}
		else if (!user) {
			var err = new Error('Email not found');
			err.status = 401;
			return callback(err);
		}
		else {
			bcrypt.compare(password , user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				}
				else {
					return callback('Wrong password');
				}
			})
		}
	});
};

userSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('User', userSchema)
