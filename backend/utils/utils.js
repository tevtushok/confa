const API_CODES = require('./apiCodes');
function handleResponse(req, res, statusCode, data, apiCode = null, message) {
  let isError = false;
  switch (statusCode) {
    case 204:
    case 400:
    case 500:
    isError = true;
    apiCode = apiCode || API_CODES.FAILURE;
    break;
    case 401:
    isError = true;
    apiCode = apiCode || API_CODES.FAILURE;
    // jwt.clearTokens(req, res);
    break;
    case 403:
    isError = true;
    apiCode = apiCode || API_CODES.FAILURE;
    // jwt.clearTokens(req, res);
    break;
    default:
    break;
  }

  console.log(apiCode);

  const response = data || {};
  response._code = apiCode || API_CODES.SUCCESS;

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
  return false;
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
  handleResponse,
  authMiddleware
}