const User = require('../models/user');
const { handleResponse } = require('../utils/utils');
const jwt = require('../utils/jwt');
const API_CODES = require('../utils/apiCodes');
const config = require('../configs/config');

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
			return handleResponse(req, res, 400, null, API_CODE_ERROR_EMPTY_CREDENTIALS, "Email and password is required")
		}
		await User.findOne({ email: email }, (err, user) => {
			if (!user) {
				return handleResponse(req, res, 401, null, API_CODE_ERROR_INVALID_CREDENTIALS, "Invalid credentials");
			}
			if(!bcrypt.compareSync(password, user.password)) {
				return handleResponse(req, res, 401, null, API_CODE_ERROR_INVALID_CREDENTIALS, "Invalid credentials");
			}
			// 1 token for 1 user only
	  		//clearTokens(req, res);

	  		console.log('err', user);

	  		// get basic user details
	  		const userObj = jwt.getCleanUser(user);

	  		// generate access token
	  		const tokenObj = jwt.generateToken(userObj);

	  		// generate refresh token
	  		const refreshToken = jwt.generateRefreshToken(userObj.id);

	  		

	  		// refresh token list to manage the xsrf token
	  		jwt.refreshTokens[refreshToken] = tokenObj.xsrfToken;

			  // set cookies
			res.cookie('refreshToken', refreshToken, config.COOKIE_OPTIONS);
			res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);

			return handleResponse(req, res, 200, {
				user: userObj,
				token: tokenObj.token,
				expiredAt: tokenObj.expiredAt
			});
		});
	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while login');
	}
}

const logout = async (req, res, next) => {
	try {
		jwt.clearTokens(req, res);
		return handleResponse(req, res, 204);
	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while logout');
	}
}

const verifyToken = (req, res, next) => {
	const { signedCookies = {} } = req;

	const { refreshToken } = signedCookies;
	if (!refreshToken) {
		return handleResponse(req, res, 204, API_CODES.EROR_UNSIGNED_TOKEN, 'Unsigned token');
	}


	// verify xsrf token
	const xsrfToken = req.headers['x-xsrf-token'];
	if (!xsrfToken || !(refreshToken in jwt.refreshTokens) || jwt.refreshTokens[refreshToken] !== xsrfToken) {
		return handleResponse(req, res, 401, API_CODES.ERROR_VERIFY_XSRF_TOKEN, 'Unverified xsrf token');
	}

	console.debug('debug!');
	console.log('xsrfToken: ', xsrfToken);
	console.log('refreshToken: ', refreshToken)
	console.log((refreshToken in jwt.refreshTokens));
	console.log('jwt.refreshTokens: ', jwt.refreshTokens);
	console.log('jwt.refreshTokens[refreshToken]', jwt.refreshTokens[refreshToken])
	console.debug('debug!');

	//return handleResponse(req, res, 200, null, API_CODES.SUCCESS, 'xxxx');

	// verify refresh token
	verifyToken(refreshToken, '', (err, payload) => {
		if (err) {
			return handleResponse(req, res, 401, API_CODES.ERROR_PAYLOAD, 'Incorrect payload');
		}
		const dbUser = User.findById(payload.userId);
		if (!dbUser) {
			return handleResponse(req, res, 401, API_CODES.ERROR_PAYLOAD_USER, 'Invalid payload user')
		}

		// get basic user details
		const userObj = jwt.getCleanUser(user);

		// generate access token
		const tokenObj = jwt.generateToken(user);

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


module.exports = {
	register: register,
	login: login,
	logout: logout,
	verifyToken: verifyToken
}