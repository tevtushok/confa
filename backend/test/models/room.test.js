const assert = require('assert');
const Room = require('../../models/room.js');
const dbHandler = require('../db-handler');

before(async () => await dbHandler.connect());
after(async () => await dbHandler.closeDatabase());

describe('models/room', () => {

    it('test invalid room title', (done) => {
        let room = new Room({});
        let err = room.validateSync();
        assert.equal(err.errors.title.message, 'title is required');

        room = new Room({ title: 't' });
        err = room.validateSync();
        assert.equal(err.errors.title.message, 'title less than 3 characters');
        return done();
    });

    it('test invalid room number', (done) => {
        let room = new Room({});
        let err = room.validateSync();
        assert.equal(err.errors.number.message, 'number is required');

        room = new Room({ number: 0 });
        err = room.validateSync();
        assert.equal(err.errors.number.message, 'number less than minimum alowed value 1');
        return done();
    });


    // it('check invalid username', (done) => {
    //     const data = {
    //         name: invalidUsername,
    //         email: validEmail,
    //         password: validPassword,
    //     };
    //     const user = new User(data);
    //     user.validate().catch(err => {
    //         assert.ok(err);
    //         assert.equal(err.errors.name.message, 'name is invalid');
    //         return done();
    //     });
    // });

    // it('check invalid username first digit', (done) => {
    //     const data = {
    //         name: '1qsf',
    //         email: validEmail,
    //         password: validPassword,
    //     };
    //     const user = new User(data);
    //     const err = user.validateSync();
    //     assert.ok(err);
    //     assert.equal(err.errors.name.message, 'name is invalid');
    //     return done();
    // });

    // it('check invalid email', (done) => {
    //     const data = {
    //         name: validUsername,
    //         email: invalidEmail,
    //         password: validPassword,
    //     };
    //     const user = new User(data);
    //     const err = user.validateSync();
    //     assert.ok(err);
    //     assert.ok(!err.errors['name']);
    //     assert.ok(!err.errors['password']);
    //     assert.equal(err.errors.email.message, user.email + ' is not valid email');
    //     return done();
    // });

    // it('check invalid password', (done) => {
    //     const data = {
    //         name: validUsername,
    //         email: validEmail,
    //         password: invalidPassword
    //     };
    //     const user = new User(data);
    //     const err = user.validateSync();
    //     assert.ok(err);
    //     assert.ok(!err.errors['name']);
    //     assert.ok(!err.errors['email']);
    //     assert.equal(
    //         err.errors.password.message,
    //         'password must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?');
    //     return done();
    // });
});
