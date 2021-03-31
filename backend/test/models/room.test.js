const assert = require('assert');
const Room = require('../../models/room.js');


describe('models/room', () => {
    it('test invalid title', (done) => {
        let room = new Room({});
        let err = room.validateSync();
        assert.equal(err.errors.title.message, 'title is required');

        room = new Room({ title: 't' });
        err = room.validateSync();
        assert.equal(err.errors.title.message, 'title less than 3 characters');
        return done();
    });

    it('test duplicate number', (done) => {
        const room = new Room({ number: 1, title: 'room title' });
        room.save((err, res) => {
            assert.ok(!err);
            const dupRoom = new Room({number: room.number, title: 'new title'});
            dupRoom.save((err, res) => {
                assert.ok(err);
                assert.equal(err.code, 11000); // MongoError: E11000 duplicate key error dup key
                assert.ok(err.message.indexOf('{ : 1 }'));
                return done();
            });
        });
    });

    it('test invalid number', (done) => {
        let room = new Room({});
        let err = room.validateSync();
        assert.equal(err.errors.number.message, 'number is required');

        room = new Room({ number: 0 });
        err = room.validateSync();
        assert.equal(err.errors.number.message, 'number less than minimum alowed value 1');
        return done();
    });

    it('test duplicate number', (done) => {
        const room = new Room({ number: 1, title: 'room title' });
        room.save((err, res) => {
            assert.ok(!err);
            const dupRoom = new Room({number: 2, title: room.title});
            dupRoom.save((err, res) => {
                assert.ok(err);
                assert.equal(err.code, 11000); // MongoError: E11000 duplicate key error dup key
                assert.ok(-1 !== err.message.indexOf('{ : "room title" }'));
                return done();
            });
        });
    });

    it('test status not valid enum values', (done) => {
        const room = new Room({ number: 1, title: 'room title', status: 'invalid status' });
        const err = room.validateSync();
        assert.equal('status is not valid enum value', err.errors.status);
        return done();
    });
});
