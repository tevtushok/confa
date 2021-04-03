const mongoose = require('mongoose');
const assert = require('chai').assert;
const User = require('../../models/user.js');
const Room = require('../../models/room.js');
const Event = require('../../models/event.js');
const { minutes, hours} = require('../utils').times;
const userUtils = require('../userUtils');
const roomUtils = require('../roomUtils');

describe('models/event', () => {
    beforeEach(async() => {
        await User.deleteMany({});
        await Room.deleteMany({});
        await Event.deleteMany({});
    });
    const createRoom = () => {
        const room = new Room({
            number: roomUtils.generateRoomNumber(),
            title: roomUtils.generateRoomTitle(),
            status: 'active',
        });
        return room.save();
    };
    const createUser = () => {
        const user = new User({
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        });
        return user.save();
    };

    const createEvent = async(date_start, date_end) => {
        try {
            const user = await createUser();
            const room = await createRoom();
            const event = new Event({
                roomId: room.id,
                userId: user.id,
                title: 'event title',
                description: 'event description',
                status: 'active',
                date_start: date_start,
                date_end: date_end,
            });
            await event.save();
            return event;
        }
        catch(err) {
            throw err;
        }
    };

    it('check getEventsBetweenDates method', async function () {
        const eventDateStart = new Date('2021 10:40');
        const eventDateEnd = new Date('2021 10:50');
        let date_end = null, date_start = null;
        // 10:40-10:50
        const event = await createEvent(eventDateStart, eventDateEnd);
        assert.ok(event);

        // 10:40-10:50 - 10:40-10:50
        date_start = new Date('2021 10:40');
        date_end = new Date('2021 10:50');
        Event.getEventsBetweenDates(event.roomId, date_start, date_end, false, (err, res) => {
            assert.isNotEmpty(res);
        });

        // 10:40-10:50 - 10:30-10:40
        date_start = new Date('2021 10:30');
        date_end = new Date('2021 10:40');
        Event.getEventsBetweenDates(event.roomId, date_start, date_end, false, (err, res) => {
            assert.isEmpty(res);
        });

        // 10:40-10:50 - 10:30-10:41
        date_start = new Date('2021 10:30');
        date_end = new Date('2021 10:41');
        Event.getEventsBetweenDates(event.roomId, date_start, date_end, false, (err, res) => {
            assert.isNotEmpty(res);
        });

        //10:40-10:50 -  10:49-10:55
        date_start = new Date('2021 10:49');
        date_end = new Date('2021 10:55');
        Event.getEventsBetweenDates(event.roomId, date_start, date_end, false, (err, res) => {
            assert.isNotEmpty(res);
        });

        // 10:40-10:50 - 10:50-10:55
        date_start = new Date('2021 10:50');
        date_end = new Date('2021 10:55');
        Event.getEventsBetweenDates(event.roomId, date_start, date_end, false, (err, res) => {
            assert.isEmpty(res);
        });

        //10:40-10:50 -  10:30-10:41 status is closed
        event.status = 'closed';
        event.save((err, res) => {
            if (err) throw err;
            date_start = new Date('2021 10:30');
            date_end = new Date('2021 10:41');
            Event.getEventsBetweenDates(event.roomId, event.date_start, event.date_end, false, (err, res) => {
                assert.isEmpty(res);
            });
        });
    });

    it('check roomId field', (done) => {
        let err = new Event({}).validateSync();
        assert.equal('roomId is required', err.errors.roomId.message);

        err = new Event({roomId: ''}).validateSync();
        assert.nestedPropertyVal(err, 'errors.roomId.name', 'CastError');

        err = new Event({roomId: '1n1r1e11'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.roomId.name', 'CastError');

        err = new Event({roomId: mongoose.Types.ObjectId()}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.roomId');
        }
        return done();
    });


    it('check userId field', (done) => {
        let err = new Event({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.userId.message', 'userId is required');

        err = new Event({userId: ''}).validateSync();
        assert.nestedPropertyVal(err, 'errors.userId.name', 'CastError');

        err = new Event({userId: '1231023sdfx'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.userId.name', 'CastError');

        err = new Event({userId: mongoose.Types.ObjectId()}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.userId');
        }
        return done();
    });

    it('check title field', (done) => {
        let err = new Event({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.title.message', 'title is required');

        err = new Event({title: 'tq'}).validateSync();
        assert.equal(err.errors.title.message, 'title less than 3 characters');

        err = new Event({title: 'tq1'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.title');
        }
        return done();
    });

    it('check description field', (done) => {
        let err = new Event({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.description.message', 'description is required');

        err = new Event({description: ''}).validateSync();
        assert.equal(err.errors.description.message, 'description is required');

        err = new Event({description: '1'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.description');
        }
        return done();
    });

    it('check status field', (done) => {
        let event = new Event({});
        // status should have default value
        assert.equal('closed', event.status);
        let err = event.validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.status');
        }

        err = new Event({status: 'quo'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.status.message', 'status is not valid enum value');

        err = new Event({status: 'active'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.status');
        }

        err = new Event({status: 'closed'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.status');
        }

        return done();
    });

    it('check date_start field', (done) => {
        let err = new Event({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_start.message', 'date_start is required');

        err = new Event({date_start: '1q'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_start.name', 'CastError');

        err = new Event({date_start: '2020q-12'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_start.name', 'CastError');

        err = new Event({date_start: '2020-12'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.date_start');
        }

        return done();
    });

    it('check date_end field', (done) => {
        let err = new Event({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_end.message', 'date_end is required');

        err = new Event({date_end: '1q'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_end.name', 'CastError');

        err = new Event({date_end: '2020q-12'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.date_end.name', 'CastError');

        err = new Event({date_end: '2020-12'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.date_end');
        }

        return done();
    });


    it('save success', (done) => {
        createUser().then(user => {
            createRoom().then(room => {
                const date_start = new Date();
                const date_end = new Date();
                date_end.setMinutes(date_end.getMinutes() + 30);

                const event = new Event({
                    roomId: room.id,
                    userId: user.id,
                    title: 'event title',
                    description: 'event description',
                    status: 'active',
                    date_start: date_start,
                    date_end: date_end,
                });
                event.save((err, event) => {
                    if (err) return done(err);
                    assert.ok(!err);
                    if (err) return done(err);
                    return done();
                });
            }).catch(err => {
                return done(err);
            });
        }).catch(err => {
            return done(err);
        });
    });

    it('check date_end more than date_start', (done) => {
        createUser().then(user => {
            createRoom().then(room => {
                let err = null;
                const date_start = new Date();
                const date_end = new Date();
                err = new Event({
                    roomId: room.id,
                    userId: user.id,
                    title: 'event title',
                    status: 'active',
                    date_start: date_start,
                    date_end: date_end,
                }).validateSync();
                assert.nestedProperty(err, 'errors.date_end');

                date_end.setMinutes(date_end.getMinutes() - 1);
                err = new Event({
                    roomId: room.id,
                    userId: user.id,
                    title: 'event title',
                    status: 'active',
                    date_start: date_start,
                    date_end: date_end,
                }).validateSync();
                assert.nestedProperty(err, 'errors.date_end');

                date_end.setMinutes(date_end.getMinutes() + 2);
                err = new Event({
                    roomId: room.id,
                    userId: user.id,
                    title: 'event title',
                    status: 'active',
                    date_start: date_start,
                    date_end: date_end,
                }).validateSync();
                if (err) assert.notNestedProperty(err, 'errors.date_end');
                return done();
            }).catch(err => {
                return done(err);
            });
        }).catch(err => {
            return done(err);
        });
    });

});


