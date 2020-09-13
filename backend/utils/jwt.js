const jwt = require('jsonwebtoken');
const moment = require('moment');
const randtoken = require('rand-token');
const ms = require('ms');
const config = require('../configs/config');

const Jwt = {
	refreshTokens: {},
	generateToken: (user) => {
  		if (!user) return null;

  		const u = {
  			id: user.id,
  			email: user.email,
  		};

	  const xsrfToken = randtoken.generate(24);
	  const privateKey = process.env.JWT_SECRET + xsrfToken;
	  const token = jwt.sign(u, privateKey, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
	  const expiredAt = moment().add(ms(process.env.ACCESS_TOKEN_LIFE), 'ms').valueOf()

	  return {
	    token, 
	    expiredAt,
	    xsrfToken,
	  }
	},


	generateRefreshToken: (userId) => {
	  if (!userId) return null;

	  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
	},

	verifyToken: (token, xsrfToken = '', cb) => {
	  const privateKey = process.env.JWT_SECRET + xsrfToken;
	  jwt.verify(token, privateKey, cb);
	},

	getCleanUser: (user) => {
		if (!user) return null;
		return {
			id: user.id,
			email: user.email,
		};
	},

	clearTokens: (req, res) =>{
		const { signedCookies = {} } = req;
		const { refreshToken } = signedCookies;
		delete Jwt.refreshTokens[refreshToken];
		res.clearCookie('XSRF-TOKEN');
		res.clearCookie('refreshToken', config.COOKIE_OPTIONS);
	},

}

module.exports = Jwt;