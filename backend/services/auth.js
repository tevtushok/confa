
const User = require('../models/user');
const { handleResponse } = require('../utils/utils');
const { SUCCESS, FAILURE, ERRORS } = require('../utils/apiCodes');
const { cookie_options } = require('../configs/config');
const jsonwebtoken = require('jsonwebtoken');

module.exports.register = async (req, res, next) => {
	const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});

    err = newUser.validateSync();
    if (err) {
        return handleResponse(req, res, 400, ERRORS.AUTH.REGISTER_VALIDATION, err, 'Validation error');
    }

    User.findOne({ email: newUser.email}, (err, user) => {
        if (err) {
            return handleResponse(req, res, 500, ERRORS.AUTH.REGISTER, err, 'Error while saving user');
        }
        if (user) {
            return handleResponse(req, res, 400, ERRORS.AUTH.REGISTER_EMAIL_EXISTS, null, 'Email should be unique');
        }
        newUser.save((err, user) => {
            if (err) {
                return handleResponse(req, res, 500, ERRORS.AUTH.REGISTER, err, 'Database error');
            }
            return handleResponse(req, res, 201, SUCCESS, null, 'User added');
        });
    });
}

module.exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		return handleResponse(req, res, 400, ERRORS.AUTH.LOGIN_EMPTY_CREDENTIALS, null, "Email and password is required")
	}
	User.authenticate(email, password,  function (err, user) {
		if (err || !user) {
			return handleResponse(req, res, 401, ERRORS.AUTH.LOGIN_INVALID_CREDENTIALS, null, "Invalid credentials");
		}

		const jwtData = {
			email: user.email,
			password: user.password,
			role: user.role
		};
		const token = jsonwebtoken.sign(jwtData, process.env.JWT_SECRET);

		// save token to client cookies
		res.cookie('token', token, cookie_options);

		const ret = {
			token: token,
			user: {
				name: user.name,
				email: user.email,
				role: user.role
			}
		};

		return handleResponse(req, res, 201, SUCCESS, ret, 'Logged in');
	});
}

module.exports.logout = (req, res, next) => {
		res.clearCookie('token', cookie_options);
		return handleResponse(req, res, 201, SUCCESS, null, 'Logged out');
}

module.exports.verify = (req, res) => {
	if (!req.user || !('email' in req.user) || !('password' in req.user)) {
		return handleResponse(req, res, 401, ERRORS.AUTH.VERIFY_UNSIGNED_TOKEN, null, 'Unsigned token');
	}

	User.findOne({email: req.user.email, status: 'enabled'})
	.then(user => {
		const ret = {
			user: {
				name: user.name,
				email: user.email,
				role: user.role
			}
		};

		return handleResponse(req, res, 200, SUCCESS, ret, 'Token verified');
	})
	.catch(err => {
		return handleResponse(req, res, 401, ERRORS.AUTH.VERIFY_INVALID_USER, null, 'Invalid user');
	});
}
