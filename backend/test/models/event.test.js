const User = require('../../models/user.js');
const Room = require('../../models/room.js');
const Event = require('../../models/event.js');
const mongoose = require('mongoose');
const assert = require('chai').assert;
const { minutes, hours} = require('../utils').times;
const userUtils = require('../userUtils');

describe('models/event', () => {
    const createRoom = () => {
        const room = new Room({
            number: 1,
            title: 'room title',
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

    it('check getRoomEventsBeetwenDates method', async function () {
        const now = new Date();
        const event = await createEvent(now, (now.getTime() + minutes(30)));
        Event.getRoomEventsBeetwenDates(event.roomId, now, (now.getTime() + minutes(30)), (err, res) => {
            assert.ok(res);
        });
        Event.getRoomEventsBeetwenDates(event.roomId, now, (now.getTime() - minutes(1)), (err, res) => {
            assert.notOk(res.length);
        });
        Event.getRoomEventsBeetwenDates(event.roomId, (now.getTime() + minutes(1)), (now.getTime() + minutes(30)), (err, res) => {
            assert.notOk(res.length);
        });
        event.status = 'closed';
        await event.save();
        Event.getRoomEventsBeetwenDates(event.roomId, event.date_start, event.date_end, (err, res) => {
            assert.notOk(res.length);
        });
    });

    it('check roomId field', (done) => {
        let err = new Event({}).validateSync();
        assert.equal('roomId is required', err.errors.roomId.message);

        err = new Event({roomId: ''}).validateSync();
        assert.equal(err.errors.roomId.name, 'CastError');

        err = new Event({roomId: '1n1r1e11'}).validateSync();
        assert.equal(err.errors.roomId.name, 'CastError');

        err = new Event({roomId: mongoose.Types.ObjectId()}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.roomId');
        }
        return done();
    });


    it('check userId field', (done) => {
        let err = new Event({}).validateSync();
        assert.equal('userId is required', err.errors.userId.message);

        err = new Event({userId: ''}).validateSync();
        assert.equal(err.errors.userId.name, 'CastError');

        err = new Event({userId: '1231023sdfx'}).validateSync();
        assert.equal(err.errors.userId.name, 'CastError');

        err = new Event({userId: mongoose.Types.ObjectId()}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.userId');
        }
        return done();
    });

    it('check title field', (done) => {
        let err = new Event({}).validateSync();
        assert.equal(err.errors.title.message, 'title is required');

        err = new Event({title: 'tq'}).validateSync();
        assert.equal(err.errors.title.message, 'title less than 3 characters');

        err = new Event({title: 'tq1'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.title');
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
        assert.equal(err.errors.status.message, 'status is not valid enum value');

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
        assert.equal(err.errors.date_start.message, 'date_start is required');

        err = new Event({date_start: '1q'}).validateSync();
        assert.equal(err.errors.date_start.name, 'CastError');

        err = new Event({date_start: '2020q-12'}).validateSync();
        assert.equal(err.errors.date_start.name, 'CastError');

        err = new Event({date_start: '2020-12'}).validateSync();
        if (err) {
            assert.notNestedProperty(err, 'errors.date_start');
        }

        return done();
    });

    it('check date_end field', (done) => {
        let err = new Event({}).validateSync();
        assert.equal(err.errors.date_end.message, 'date_end is required');

        err = new Event({date_end: '1q'}).validateSync();
        assert.equal(err.errors.date_end.name, 'CastError');

        err = new Event({date_end: '2020q-12'}).validateSync();
        assert.equal(err.errors.date_end.name, 'CastError');

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

});


