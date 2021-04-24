const jsonwebtoken = require('jsonwebtoken');
const { cookie_options } = require('../configs/config');
const User = require('../models/user');
const { jsonResponse } = require('../includes/utils');
const { SUCCESS, FAILURE, API } = require('../includes/codes');
const { UserError } = require('../includes/errors/models');

module.exports.register = async (req, res, next) => {
	const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});

    err = newUser.validateSync();
    if (err) {
        return jsonResponse(req, res, 400, API.AUTH.VALIDATION, err, 'Validation error');
    }

    User.findOne({ email: newUser.email}, (err, user) => {
        if (err) {
            return jsonResponse(req, res, 500, API.AUTH.FAILURE, err, 'Error while saving user');
        }
        if (user) {
            return jsonResponse(req, res, 400, API.AUTH.EMAIL_EXISTS, null, 'Email should be unique');
        }
        newUser.save((err, user) => {
            if (err) {
                return jsonResponse(req, res, 500, API.AUTH.FAILURE, err, 'Database error');
            }
            return jsonResponse(req, res, 201, SUCCESS, null, 'User added');
        });
    });
}

module.exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		return jsonResponse(req, res, 400, API.AUTH.EMPTY_CREDENTIALS, null, "Email and password is required")
	}
	User.authenticate(email, password,  function (err, user) {
        if (err instanceof UserError) {
            return jsonResponse(req, res, 400, API.AUTH.INVALID_CREDENTIALS, null, "Invalid credentials");
        }
        if (err || !user) {
            return jsonResponse(req, res, 500, API.AUTH.FAILURE, err, "Server error");
        }
		const jwtData = {
            id: user.id,
			email: user.email,
			password: user.password,
            isAdmin: user.isAdmin
		};
		const token = jsonwebtoken.sign(jwtData, process.env.JWT_SECRET);

		// // save token to client cookies
		// res.cookie('token', token, cookie_options);

        const ret = {'user': {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
        }};

		return jsonResponse(req, res, 201, SUCCESS, ret, 'Logged in');
	});
}

module.exports.logout = (req, res, next) => {
		res.clearCookie('token', cookie_options);
		return jsonResponse(req, res, 201, SUCCESS, null, 'Logged out');
}

module.exports.verify = (req, res) => {
	if (!req.user || !('email' in req.user) || !('password' in req.user)) {
		return jsonResponse(req, res, 403, API.AUTH.UNSIGNED_TOKEN, null, 'Unsigned token');
	}

	User.findOne({email: req.user.email, status: 'enabled'})
	.then(user => {
		const ret = {
			user: {
                id: user.id,
				name: user.name,
				email: user.email,
                isAdmin: user.isAdmin,
			}
		};
		return jsonResponse(req, res, 200, SUCCESS, ret, 'Token verified');
	})
	.catch(err => {
		return jsonResponse(req, res, 400, API.AUTH.INVALID_USER, null, 'Invalid user');
	});
}
