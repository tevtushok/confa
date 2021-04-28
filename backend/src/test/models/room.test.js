const assert = require('chai').assert;
const Room = require('../../models/room.js');
const RoomUtils = require('../roomUtils');


describe('models/room', () => {
    beforeEach(async() => {
        await Room.deleteMany({});
    });

    it('test invalid title', (done) => {
        let room = new Room({});
        let err = room.validateSync();
        assert.nestedPropertyVal(err, 'errors.title.message', 'title is required');

        room = new Room({ title: 't' });
        err = room.validateSync();
        assert.nestedPropertyVal(err, 'errors.title.message', 'title less than 3 characters');
        return done();
    });

    it('test duplicate number', (done) => {
        const room = new Room({
            number: RoomUtils.generateRoomNumber(),
            title: RoomUtils.generateRoomTitle(),
        });
        room.save((err, res) => {
            assert.ok(!err);
            const dupRoom = new Room({
                number: room.number,
                title: RoomUtils.generateRoomTitle(),
            });
            dupRoom.save((err, res) => {
                assert.ok(err);
                assert.nestedPropertyVal(err, 'code', 11000); // MongoError: E11000 duplicate key error dup key
                return done();
            });
        });
    });

     it('test invalid number', (done) => {
         let room = new Room({});
         let err = room.validateSync();
         assert.nestedPropertyVal(err, 'errors.number.message', 'number is required');

         room = new Room({ number: -(RoomUtils.generateRoomNumber())});
         err = room.validateSync();
         assert.nestedPropertyVal(err, 'errors.number.message', 'number less than minimum alowed value 1');
         return done();
     });

    it('test duplicate title', (done) => {
        const room = new Room({
            number: RoomUtils.generateRoomNumber(),
            title: RoomUtils.generateRoomTitle(),
        });
        room.save((err, res) => {
            assert.ok(!err);
            const dupRoom = new Room({
                number: RoomUtils.generateRoomNumber(),
                title: room.title,
            });
            dupRoom.save((err, res) => {
                assert.ok(err);
                assert.equal(err.code, 11000); // MongoError: E11000 duplicate key error dup key
                return done();
            });
        });
    });

    it('test status not valid enum values', (done) => {
        const room = new Room({
            number: RoomUtils.generateRoomNumber(),
            title: RoomUtils.generateRoomTitle(),
            status: 'invalid dqqq',
        });
        const err = room.validateSync();
        assert.equal('status is not valid enum value', err.errors.status);
        return done();
    });
});
