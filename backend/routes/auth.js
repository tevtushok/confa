const {
  refreshTokens, COOKIE_OPTIONS, generateToken, generateRefreshToken,
  getCleanUser, verifyToken, clearTokens, handleResponse,
} = require('../utils/utils');


const router = require('express').Router();

const User = require('../models/user');

router.post('/register', async (req, res) => {
	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	})

	const isEmailExists = await User.findOne({ email: user.email});
	if (isEmailExists) {
		return handleResponse(req, res, 400, null, API_CODE_ERROR_EMAIL_EXISTS, 'Email should be unique');
	}

	try {
		const savedUser = await user.save();
		return handleResponse(req, res, 201, null, API_CODE_SUCCESS, 'User added');
	}
	catch(err) {
		return handleResponse(req, res, 400, err, API_CODE_ERROR_REGISTER_USER, 'Error while adding user');
	}
});

router.post('/login', async (req, res) => {
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


});

router.post('/logout', (req, res) => {
  clearTokens(req, res);
  return handleResponse(req, res, 204);
});

// verify the token and return new tokens if it's valid
router.post('/verifyToken', (req, res) => {
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
  	else {
  		User.findById(payload.userId, (err, user) => {
  			if (err) {
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
		});
  	}
  })
});

module.exports = router;