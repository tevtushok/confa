const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { UserError } = require('../includes/errors/models/errors');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
        required: [true, '{PATH} is required'],
        match: [/^[A-Za-z]\w{4,30}$/, '{PATH} is invalid'],
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
            return callback(new UserError(401,'Email not found'));
		}
		else {
			bcrypt.compare(password , user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				}
				else {
                    return callback(new UserError(401,'Authentication failed'));
				}
			})
		}
	});
};

userSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('User', userSchema)
