const jsonwebtoken = require('jsonwebtoken');
const API_CODES = require('./apiCodes');

function handleResponse(req, res, statusCode, apiCode = null, data = null, message = null) {
  let isSuccess = true;
  switch (statusCode) {
    case 204:
    case 400:
    case 500:
    case 401:
    case 403:
      isSuccess = false;
      apiCode = apiCode || API_CODES.FAILURE;
      break;
    default:
      break;
  }

  let response = {};
  response.code = apiCode || API_CODES.SUCCESS;
  if (message) {
    response.message = message;
  }
  response.success = isSuccess;

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            handleResponse(req, res, statusCode, null, null, err);
            break;
        case err.name === 'ValidationError':
            // mongoose validation error
            handleResponse(req, res, 400, null, null, err.message);
            break;
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            handleResponse(req, res, 401, API_CODES.EROR_JWT_UNAUTHORIZED, null, 'Unauthorized');
            break;
        default:
            handleResponse(req, res, 401, API_CODES.FAILURE, null, err.message);
    }
    next();
}

function signJWT(data) {
  const token = jsonwebtoken.sign(data, process.env.JWT_SECRET);
  return token;
}


/*

// middleware that checks if JWT token exists and verifies it if it does exist.
// In all private routes, this helps to know if the request is authenticated or not.
const authMiddleware = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return handleResponse(req, res, 401, 
    API_CODES.ERROR_AUTH_MIDDLEEARE_TOKEN,
    'Empty token'
    );

  token = token.replace('Bearer ', '');

  // get xsrf token from the header
  const xsrfToken = req.headers['x-xsrf-token'];
  if (!xsrfToken) {
    return handleResponse(req, res, 403,
      API_CODES.ERROR_AUTH_MIDDLEEARE_XSRF_TOKEN,
      'Empty xsrf token'
      );
  }

  // verify xsrf token
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken || !(refreshToken in refreshTokens)
    || refreshTokens[refreshToken] !== xsrfToken) {
    return handleResponse(req, res, 401,
      API_CODES.ERROR_AUTH_MIDDLEEARE_UNMATCHED_XSRF_TOKEN,
      'Unmatched input token'
      );
}

  // verify token with secret key and xsrf token
  verifyToken(token, xsrfToken, (err, payload) => {
    if (err)
      return handleResponse(req, res, 401,
        API_CODES.ERROR_AUTH_MIDDLEEARE_UNVERIFIED_XSRF_TOKEN,
        'Unverified XSRF token'
        );
    else {
      req.user = payload; //set the user to req so other routes can use it
      next();
    }
  });
}
*/

module.exports = {
  handleResponse,
  errorHandler,
  signJWT,
  //authMiddleware
}