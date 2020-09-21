const User = require('../models/user');
const { handleResponse, signJWT } = require('../utils/utils');
const API_CODES = require('../utils/apiCodes');
const {cookie_options} = require('../configs/config');
const jsonwebtoken = require('jsonwebtoken');

const register = async (req, res, next) => {
	try {
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		});

		const isEmailExists = await User.findOne({ email: user.email});
		if (isEmailExists) {
			return handleResponse(req, res, 400, API_CODES.ERROR_EMAIL_EXISTS, null, 'Email should be unique');
		}
		
		const savedUser = await user.save();
		return handleResponse(req, res, 201, API_CODES.SUCCESS, null, 'User added');
	} catch(err) {
		return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while adding user');
	}
}

const login = async (req, res, next) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		if (!email || !password) {
			return handleResponse(req, res, 400, API_CODES.ERROR_EMPTY_CREDENTIALS, null, "Email and password is required")
		}
		await User.authenticate(email, password,  function (err, user) {
			if (err || !user) {
				return handleResponse(req, res, 401, API_CODES.ERROR_INVALID_CREDENTIALS, null, "Invalid credentials");
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

			return handleResponse(req, res, 200, API_CODES.SUCCESS, ret, 'Logged in');
		});
	}
	catch(err) {
		return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while login');
	}
}

const logout = async (req, res, next) => {
	try {
		res.clearCookie('token', cookie_options);
		return handleResponse(req, res, 200, API_CODES.SUCCESS, null, 'Logged out');
	}
	catch(err) {
		return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while logout');
	}
}

const verify = async (req, res) => {
	try {
		if (!req.user || !('email' in req.user) || !('password' in req.user)) {
			return handleResponse(req, res, 401, API_CODES.EROR_UNSIGNED_TOKEN, null, 'Unsigned token');
		}

		await User.findOne({email: req.user.email}, (err, user) => {
			if (err || req.user.password != user.password) {
				return handleResponse(req, res, 401, API_CODES.EROR_INVALID_TOKEN, null, 'Invalid token');
			}
			const ret = {
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };

			return handleResponse(req, res, 200, API_CODES.SUCCESS, ret, 'Token verified');
		})
	}
	catch(err) {
		return handleResponse(req, res, 500, API_CODES.FAILURE, err, 'Error while verify');
	}	

	
}

module.exports = {
	register: register,
	login: login,
	logout: logout,
	verify: verify,
}
