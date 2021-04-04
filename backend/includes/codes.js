// API CODES
module.exports.API = {
    AUTH: {
        REGISTER: 1000,
        REGISTER_VALIDATION: 1101,
        REGISTER_EMAIL_EXISTS: 1102,
        LOGIN: 200,
        LOGIN_EMPTY_CREDENTIALS: 1201,
        LOGIN_INVALID_CREDENTIALS: 1202,
        LOGOUT: 1300,
        VERIFY: 1400,
        VERIFY_UNSIGNED_TOKEN: 1401,
        VERIFY_INVALID_USER: 1402,
    },
    EVENTS: {
        ADD: 1500,
        ADD_VALIDATION: 1501,
        ADD_ROOM_NOT_EXISTS: 1502,
        ADD_ROOM_NOT_ACTIVE: 1503,
        ADD_CROSS_DATES: 1504,
    },
    LOGIN: {
        EMPTY_CREDENTIALS: 111111,
        INVALID_CREDENTIALS: 1003,
        JWT_UNAUTHORIZED: 1004,
        UNSIGNED_TOKEN: 1005,
        INVALID_TOKEN: 1006,
        EMAIL_EXISTS: 1005,
    },
}

// MONGOOSE MODELS CODES
module.exports.MODELS = {
    EVENT: {
        CROSS_DATES: 2000
    },
    USER: {
        EMAIL_NOT_FOUND: 2100,
        INVALID_PWD: 2101,
    },
};

// APP MIDDLEWARE CODES
module.exports.MIDDLEWARE = {
    JWT: {
        UNAUTHORIZED: 3000,
    },
}

module.exports.ADMIN = {
    ROOMS: {
        GET_FAILURE: 10000,
        SAVING_FAILURE: 10001,
        DUPLICATE: 10002,
        INVALID_INPUT: 10003,
        DELETING_ROOMS: 10004,
        ROOM_NOT_EXISTS: 10005,
    }
}

module.exports.SUCCESS = 0;
module.exports.FAILURE = 1;
