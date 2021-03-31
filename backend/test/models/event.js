const User = require('../../models/user.js');
const Room = require('../../models/room.js');
const Event = require('../../models/event.js');
const userGenerator = require('../userGenerator');
const mongoose = require('mongoose');
const { assert, expect } = require('chai');

describe('test models/event', () => {
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
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
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

    it('checkit', async function () {
        try {
            const date_start = new Date();
            const date_end = new Date();
            date_end.setMinutes(date_end.getMinutes() + 30);
            const event = await createEvent(date_start, date_end);
            Event.getRoomEventsBeetwenDates(event.roomId, date_start, date_end, (err, res) => {
                assert.ok(res);
            });
            date_end.setSeconds(date_end.getSeconds() - 100);
            Event.getRoomEventsBeetwenDates(event.roomId, date_start, date_end, (err, res) => {
                console.log(res);
                assert.notOk(res.length);
            });
        }
        catch(err) {
            assert.notOk(JSON.stringify(err));
        }
    });

    // it('check roomId', (done) => {
    //     let err = new Event({}).validateSync();
    //     assert.equal('roomId is required', err.errors.roomId.message);

    //     err = new Event({roomId: ''}).validateSync();
    //     assert.equal(err.errors.roomId.name, 'CastError');

    //     err = new Event({roomId: '1n1r1e11'}).validateSync();
    //     assert.equal(err.errors.roomId.name, 'CastError');

    //     err = new Event({roomId: mongoose.Types.ObjectId()}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.roomId');
    //     }
    //     return done();
    // });


    // it('check userId', (done) => {
    //     let err = new Event({}).validateSync();
    //     assert.equal('userId is required', err.errors.userId.message);

    //     err = new Event({userId: ''}).validateSync();
    //     assert.equal(err.errors.userId.name, 'CastError');

    //     err = new Event({userId: '1231023sdfx'}).validateSync();
    //     assert.equal(err.errors.userId.name, 'CastError');

    //     err = new Event({userId: mongoose.Types.ObjectId()}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.userId');
    //     }
    //     return done();
    // });

    // it('check title', (done) => {
    //     let err = new Event({}).validateSync();
    //     assert.equal(err.errors.title.message, 'title is required');

    //     err = new Event({title: 'tq'}).validateSync();
    //     assert.equal(err.errors.title.message, 'title less than 3 characters');

    //     err = new Event({title: 'tq1'}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.title');
    //     }
    //     return done();
    // });

    // it('check status', (done) => {
    //     let event = new Event({});
    //     // status should have default value
    //     assert.equal('closed', event.status);
    //     let err = event.validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.status');
    //     }

    //     err = new Event({status: 'quo'}).validateSync();
    //     assert.equal(err.errors.status.message, 'status is not valid enum value');

    //     err = new Event({status: 'active'}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.status');
    //     }

    //     err = new Event({status: 'closed'}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.status');
    //     }

    //     return done();
    // });

    // it('check date_start', (done) => {
    //     let err = new Event({}).validateSync();
    //     assert.equal(err.errors.date_start.message, 'date_start is required');

    //     err = new Event({date_start: '1q'}).validateSync();
    //     assert.equal(err.errors.date_start.name, 'CastError');

    //     err = new Event({date_start: '2020q-12'}).validateSync();
    //     assert.equal(err.errors.date_start.name, 'CastError');

    //     err = new Event({date_start: '2020-12'}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.date_start');
    //     }

    //     return done();
    // });

    // it('check date_end', (done) => {
    //     let err = new Event({}).validateSync();
    //     assert.equal(err.errors.date_end.message, 'date_end is required');

    //     err = new Event({date_end: '1q'}).validateSync();
    //     assert.equal(err.errors.date_end.name, 'CastError');

    //     err = new Event({date_end: '2020q-12'}).validateSync();
    //     assert.equal(err.errors.date_end.name, 'CastError');

    //     err = new Event({date_end: '2020-12'}).validateSync();
    //     if (err) {
    //         assert.notNestedProperty(err, 'errors.date_end');
    //     }

    //     return done();
    // });

    // it('getRoomEventsByInterval', (done) => {
    //     createUser().then(user => {
    //         createRoom().then(room => {
    //             const date_start = new Date();
    //             const date_end = new Date();
    //             date_end.setMinutes(date_end.getMinutes() + 30);

    //             const event = new Event({
    //                 roomId: room.id, 
    //                 userId: user.id,
    //                 title: 'event title',
    //                 status: 'active',
    //                 date_start: date_start,
    //                 date_end: date_end,
    //             });
    //             event.save((err, event) => {
    //                 if (err) return done(err);
    //                 assert.ok(!err);
    //                 // lets check data events
    //                 if (err) return done(err);
    //                 return done();
    //             });
    //         }).catch(err => {
    //             return done(err);
    //         });
    //     }).catch(err => {
    //         return done(err);
    //     });
    // });

    // it('create success', (done) => {
    //     createUser().then(user => {
    //         createRoom().then(room => {
    //             const date_start = new Date();
    //             const date_end = new Date();
    //             date_end.setMinutes(date_end.getMinutes() + 30);

    //             const event = new Event({
    //                 roomId: room.id, 
    //                 userId: user.id,
    //                 title: 'event title',
    //                 status: 'active',
    //                 date_start: date_start,
    //                 date_end: date_end,
    //             });
    //             event.save((err, event) => {
    //                 if (err) return done(err);
    //                 assert.ok(!err);
    //                 if (err) return done(err);
    //                 return done();
    //             });
    //         }).catch(err => {
    //             return done(err);
    //         });
    //     }).catch(err => {
    //         return done(err);
    //     });
    // });

});


