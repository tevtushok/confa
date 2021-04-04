const { generateAlnum, times } = require('./utils')

module.exports.generateValidEventData = (roomId, status = 'active') => {
    const start = new Date();
    const end = new Date(start.getTime() + times.minutes(30));
    return {
        roomId: roomId,
        status: status,
        title: 'test_event' + generateAlnum(6),
        description: 'description_event_' + generateAlnum(6),
        date_start: start,
        date_end: end,
    };

};
