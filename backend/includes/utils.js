const { SUCCESS, FAILURE, MIDDLEWARE } = require('./codes');

function jsonResponse(req, res, statusCode, apiCode = null, data = null, message = null) {
    let isSuccess = true;
    switch (statusCode) {
        case 204:
        case 400:
        case 500:
        case 401:
        case 403:
            isSuccess = false;
            apiCode = apiCode || FAILURE;
            break;
        default:
            break;
    }

    let response = {};
    response.code = apiCode || SUCCESS;
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
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return jsonResponse(req, res, statusCode, null, null, err);
            break;
        case err.name === 'ValidationError':
            // mongoose validation error
            return jsonResponse(req, res, 400, null, null, err.message);
            break;
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return jsonResponse(req, res, 401, MIDDLEWARE.JWT.UNAUTHORIZED, null, 'Unauthorized');
            break;
        default:
            //jsonResponse(req, res, 401, API_CODES.FAILURE, null, err.message);
            next();
    }
}

function signJWT(data) {
    const token = jsonwebtoken.sign(data, process.env.JWT_SECRET);
    return token;
}

// time in ms
function sleep(time, cb = false) {
    const stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    if (cb)
        cb();
}

function validateRoomTitle(title = false) {
    return 'string' === typeof title && title.length >= 3;
}

function validateRoomNumber(number = false) {
    console.log('number', number)
    return (!isNaN(number) && number !== '');
}

function filterRequest(req, filter = []) {
    let filtered = Object.keys(req).reduce((acc, key) => {
        if (filter.includes(key)) {
            acc[key] = req[key];
        }
        return acc;
    }, {});
    return filtered;
}


module.exports = {
    jsonResponse,
    errorHandler,
    filterRequest,
    validateRoomTitle,
    validateRoomNumber,
}
