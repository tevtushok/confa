const User = require('../models/user');

const {
  refreshTokens, COOKIE_OPTIONS, generateToken, generateRefreshToken,
  getCleanUser, verifyToken, clearTokens, handleResponse,
} = require('../utils/utils');

const API_CODES = require('../utils/apiCodes')


const register = async (req, res, next) => {
	try {
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		})

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
		await User.findOne({ email: email, password: password}, (err, user) => {
			if (err) return handleResponse(req, res, 401, null, API_CODE_ERROR_INVALID_CREDENTIALS, "Invalid credentials");
			// 1 token for 1 user only
	  		//clearTokens(req, res);

	  		// get basic user details
	  		const userObj = getCleanUser(user);

	  		// generate access token
	  		const tokenObj = generateToken(userObj);

	  		// generate refresh token
	  		const refreshToken = generateRefreshToken(userObj.id);

	  		

	  		// refresh token list to manage the xsrf token
	  		refreshTokens[refreshToken] = tokenObj.xsrfToken;

			  // set cookies
			res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
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
		clearTokens(req, res);
		return handleResponse(req, res, 204);
	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while logout');
	}
}

const verifyToken = async (req, res, next) => {
	try {
		const { signedCookies = {} } = req;

		const { refreshToken } = signedCookies;
		if (!refreshToken) {
			return handleResponse(req, res, 204);
		}

		// verify xsrf token
		const xsrfToken = req.headers['x-xsrf-token'];
		if (!xsrfToken || !(refreshToken in refreshTokens) || refreshTokens[refreshToken] !== xsrfToken) {
			return handleResponse(req, res, 401, API_CODE_ERROR_VERIFY_XSRF_TOKEN);
		}

		// verify refresh token
		verifyToken(refreshToken, '', (err, payload) => {
			if (err) {
				return handleResponse(req, res, 401, API_CODE_ERROR_PAYLOAD);
			}
			const dbUser = User.findById(payload.userId);
			if (!dbUser) {
				return handleResponse(req, res, 401, API_CODE_ERROR_PAYLOAD_USER)
			}

			// get basic user details
			const userObj = getCleanUser(user);

			// generate access token
			const tokenObj = generateToken(user);

			// refresh token list to manage the xsrf token
			refreshTokens[refreshToken] = tokenObj.xsrfToken;
			res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);

			// return the token along with user details
			return handleResponse(req, res, 200, {
				user: userObj,
				token: tokenObj.token,
				expiredAt: tokenObj.expiredAt
			});
		})

	}
	catch(err) {
		return handleResponse(req, res, 500, err, API_CODES.FAILURE, 'Error while verifyToken');
	}
}


module.exports = {
	register: register,
	login: login,
	logout: logout,
	verifyToken: verifyToken
}