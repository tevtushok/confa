const User = require('../models/user');
const { handleResponse, signJWT } = require('../utils/utils');
const API_CODES = require('../utils/apiCodes');
const {cookie_options} = require('../configs/config');

const bcrypt = require('bcryptjs');


const register = async (req, res, next) => {
	try {
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		});

		const isEmailExists = await User.findOne({ email: user.email});
		if (isEmailExists) {
			return handleResponse(req, res, 400, null, API_CODES.ERROR_EMAIL_EXISTS, 'Email should be unique');
		}

		
		const savedUser = await user.save();
		return handleResponse(req, res, 201, null, API_CODES.SUCCESS, 'User added');
	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while adding user');
	}
}

const login = async (req, res, next) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		if (!email || !password) {
			return handleResponse(req, res, 400, null, API_CODES.ERROR_EMPTY_CREDENTIALS, "Email and password is required")
		}
		User.authenticate(email, password,  function (err, user) {
			if (err || !user) {
				return handleResponse(req, res, 401, null, API_CODES.ERROR_INVALID_CREDENTIALS, "Invalid credentials");
			}

			const token = signJWT({email: user.email, password: user.password});

			// save token to client cookies
			res.cookie('token', token, cookie_options);

			return handleResponse(req, res, 200, {
				token: token,
			});
		});
	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while login');
	}
}

const logout = async (req, res, next) => {
	try {
		res.clearCookie('token', cookie_options);
		return handleResponse(req, res, 204);
	}
	catch(err) {
		console.log(err);
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while logout');
	}
}

const verify = async (req, res) => {
	if (!req.user || !('email' in req.user) || !('password' in req.user)) {
		return handleResponse(req, res, 401, null, API_CODES.EROR_UNSIGNED_TOKEN, 'Unsigned token');
	}

	await User.findOne({email: req.user.email}, (err, user) => {
		if (err || req.user.password != user.password) {
			return handleResponse(req, res, 401, null, API_CODES.EROR_INVALID_TOKEN, 'Invalid token');
		}
	})

	return handleResponse(req, res, 200, null, null, 'Token verified');
}


/*
const verifyToken = (req, res, next) => {
	const { signedCookies = {} } = req;
	const { refreshToken } = signedCookies;

	if (!refreshToken) {
		return handleResponse(req, res, 204, null, API_CODES.EROR_UNSIGNED_TOKEN, 'Unsigned token');
	}

	// verify xsrf token
	const xsrfToken = req.headers['x-xsrf-token'];
	if (!xsrfToken || !(refreshToken in jwt.refreshTokens) || jwt.refreshTokens[refreshToken] !== xsrfToken) {
		return handleResponse(req, res, 401, null, API_CODES.ERROR_VERIFY_XSRF_TOKEN, 'Unverified xsrf token');
	}

	// verify refresh token
	jwt.verifyToken(refreshToken, '', async (err, payload) => {
		if (err) {
			return handleResponse(req, res, 401, null, API_CODES.ERROR_PAYLOAD, 'Incorrect payload');
		}
		const dbUser = await User.findById(payload.userId);
		if (!dbUser) {
			return handleResponse(req, res, 401, null, API_CODES.ERROR_PAYLOAD_USER, 'Invalid payload user')
		}

		// get basic user details
		const userObj = jwt.getCleanUser(dbUser);
		// generate access token
		const tokenObj = jwt.generateToken(userObj);

		// refresh token list to manage the xsrf token
		jwt.refreshTokens[refreshToken] = tokenObj.xsrfToken;
		res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);

		// return the token along with user details
		return handleResponse(req, res, 200, {
			user: userObj,
			token: tokenObj.token,
			expiredAt: tokenObj.expiredAt
		});
	})
}
*/


module.exports = {
	register: register,
	login: login,
	logout: logout,
	verify: verify,
	//verifyToken: verifyToken
}