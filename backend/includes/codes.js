// API CODES
module.exports.API = {
    AUTH: {
        REGISTER: 1000,
        VALIDATION: 1001,
        EMAIL_EXISTS: 1002,
        LOGIN: 1003,
        EMPTY_CREDENTIALS: 1004,
        INVALID_CREDENTIALS: 1005,
        LOGOUT: 1006,
        VERIFY: 1007,
        UNSIGNED_TOKEN: 1007,
        INVALID_USER: 1008,
    },
    EVENTS: {
        SAVE: 1100,
        VALIDATION: 1101,
        ROOM_NOT_EXISTS: 1102,
        ROOM_NOT_ACTIVE: 1103,
        CROSS_DATES: 1104,
        NOT_EXISTS: 1105,
        NOT_BELONG_TO_YOU: 1106,
        ID_REQUIRED: 1107,
    },
    LOGIN: {
        EMPTY_CREDENTIALS: 1200,
        INVALID_CREDENTIALS: 1201,
        JWT_UNAUTHORIZED: 1202,
        UNSIGNED_TOKEN: 1203,
        INVALID_TOKEN: 1204,
        EMAIL_EXISTS: 1205,
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

// ADMIN API CODES LEAVE HERE, OR SEPARATE TO WITH NEW FILE???
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
