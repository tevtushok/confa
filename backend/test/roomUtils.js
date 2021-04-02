const Room = require('../models/room'); 
const { generateRandomInt, generateAlnum } = require('./utils');

module.exports.createRoom = async (status = 'active') => {
    const room = await new Room({
        title: 'test_room' + generateAlnum(6),
        status: status,
        number: generateRandomInt(),
    }).save();
    return room;
};
