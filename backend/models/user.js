const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { UserError } = require('../includes/errors/models');
const CODES = require('../includes/codes').MODELS;

const userSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: {
            values: ['enabled','disabled'],
            message: '{PATH} is not valid enum value',
        },
        default: 'enabled',
    },
	name: {
		type: String,
        required: [true, '{PATH} is required'],
        match: [/^[a-z]\w{2,30}$/i, '{PATH} should starts with letter, and contain minimum 3 character'],
	},
	email: {
		type: String,
        required: [true, '{PATH} is required'],
		unique: true,
		dropDups: true,
		trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not valid email',
        },
	},
	password: {
		type: String,
        required: [true, '{PATH} is required'],
        validate: {
            validator: function (v) {
                const re = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;
                return re.test(v);
            },
            message: `{PATH} must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?`,
        },
		bcrypt: true,
	},
    isAdmin: {
        type: Boolean,
        default: false,
    },
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
            return callback(new UserError(CODES.USER.EMAIL_NOT_FOUND,'Email not found'));
		}
		else {
			bcrypt.compare(password , user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				}
				else {
                    return callback(new UserError(CODES.USER.INVALID_PWD,'Authentication failed'));
				}
			})
		}
	});
};

userSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('User', userSchema)
