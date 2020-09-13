const jwt = require('jsonwebtoken');
const moment = require('moment');
const randtoken = require('rand-token');
const ms = require('ms');


const dev = process.env.NODE_ENV !== 'production';

// refresh token list to manage the xsrf token
const refreshTokens = {};

// cookie options to create refresh token
const COOKIE_OPTIONS = {
    // domain: "localhost",
    httpOnly: true,
    secure: !dev,
    signed: true
  };

/////////////////////// define api codes

const API_CODE_SUCCESS = 0;
const API_CODE_FAILURE = 1000;

/////////////////////// define auth codes
{
  API_CODE_ERROR_REGISTER_USER =                          1001;
  API_CODE_ERROR_EMPTY_CREDENTIALS =                      1002;
  API_CODE_ERROR_INVALID_CREDENTIALS =                    1003;
  API_CODE_ERROR_VERIFY_XSRF_TOKEN =                      1004;
  API_CODE_ERROR_PAYLOAD =                                1005;
  API_CODE_ERROR_PAYLOAD_USER =                           1006;
  API_CODE_ERROR_AUTH_MIDDLEEARE_TOKEN =                  1007;
  API_CODE_ERROR_AUTH_MIDDLEEARE_EMPTY_XSRF_TOKEN =       1008;
  API_CODE_ERROR_AUTH_MIDDLEEARE_UNMATCHED_XSRF_TOKEN =   1009;
  API_CODE_ERROR_AUTH_MIDDLEEARE_UNVERIFIED_XSRF_TOKEN =  1010;
  API_CODE_ERROR_EMAIL_EXISTS =                           1011;
}

function generateToken(user) {
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

}

function generateRefreshToken(userId) {
  if (!userId) return null;

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
}

function verifyToken(token, xsrfToken, cb) {
  const privateKey = process.env.JWT_SECRET + xsrfToken;
  jwt.verify(token, privateKey, cb);
}

function getCleanUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
  };
}

function clearTokens(req, res) {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  delete refreshTokens[refreshToken];
  res.clearCookie('XSRF-TOKEN');
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
}

function handleResponse(req, res, statusCode, data, apiCode = null, message) {
  let isError = false;
  switch (statusCode) {
    case 204:
    case 400:
    case 500:
    isError = true;
    apiCode = apiCode || API_CODE_FAILURE;
    break;
    case 401:
    isError = true;
    apiCode = apiCode || API_CODE_FAILURE;
    // jwt.clearTokens(req, res);
    break;
    case 403:
    isError = true;
    apiCode = apiCode || API_CODE_FAILURE;
    // jwt.clearTokens(req, res);
    break;
    default:
    break;
  }

  const response = data || {};
  response._code = apiCode || API_CODE_SUCCESS;

  if (isError) {
    response.error = true;
  }

  if (message) {
    response._message = message;
  }

  return res.status(statusCode).json(response);
}

// middleware that checks if JWT token exists and verifies it if it does exist.
// In all private routes, this helps to know if the request is authenticated or not.
const authMiddleware = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return handleResponse(req, res, 401, 
    API_CODE_ERROR_AUTH_MIDDLEEARE_TOKEN,
    'Empty token'
    );

    token = token.replace('Bearer ', '');

  // get xsrf token from the header
  const xsrfToken = req.headers['x-xsrf-token'];
  if (!xsrfToken) {
    return handleResponse(req, res, 403,
      API_CODE_ERROR_AUTH_MIDDLEEARE_XSRF_TOKEN,
      'Empty xsrf token'
      );
  }

  // verify xsrf token
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken || !(refreshToken in refreshTokens)
    || refreshTokens[refreshToken] !== xsrfToken) {
    return handleResponse(req, res, 401,
      API_CODE_ERROR_AUTH_MIDDLEEARE_UNMATCHED_XSRF_TOKEN,
      'Unmatched input token'
      );
}

  // verify token with secret key and xsrf token
  verifyToken(token, xsrfToken, (err, payload) => {
    if (err)
      return handleResponse(req, res, 401,
        API_CODE_ERROR_AUTH_MIDDLEEARE_UNVERIFIED_XSRF_TOKEN,
        'Unverified XSRF token'
        );
    else {
      req.user = payload; //set the user to req so other routes can use it
      next();
    }
  });
}


module.exports = {
  refreshTokens,
  COOKIE_OPTIONS,
  generateToken,
  generateRefreshToken,
  verifyToken,
  getCleanUser,
  handleResponse,
  clearTokens,
  authMiddleware
}