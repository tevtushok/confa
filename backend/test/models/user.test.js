const assert = require('assert');
const User = require('../../models/user.js');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env.test' })
mongoose.connect(process.env.DB_CONNECT, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

const validUsername = 'validusername';
const invalidUsername = '1invalid';

const validEmail  = 'email@email.com';
const invalidEmail = 'email@invalid';

const validPassword = 'valiDQ#1';
const invalidPassword = 'invaLid1';

describe('models/user', () => {

    it('all empty', (done) => {
        const user = new User({});
        const err = user.validateSync();
        assert.equal(err.errors.name.message, 'name is required');
        assert.equal(err.errors.email.message, 'email is required');
        assert.equal(err.errors.password.message, 'password is required');
        return done();
    });

    it('check invalid username', (done) => {
        const data = {
            name: invalidUsername,
            email: validEmail,
            password: validPassword,
        };
        const user = new User(data);
        user.validate().catch(err => {
            assert.ok(err);
            assert.equal(err.errors.name.message, 'name is invalid');
            return done();
        });
    });

    it('check invalid username first digit', (done) => {
        const data = {
            name: '1qsf',
            email: validEmail,
            password: validPassword,
        };
        const user = new User(data);
        const err = user.validateSync();
        assert.ok(err);
        assert.equal(err.errors.name.message, 'name is invalid');
        return done();
    });

    it('check invalid email', (done) => {
        const data = {
            name: validUsername,
            email: invalidEmail,
            password: validPassword,
        };
        const user = new User(data);
        const err = user.validateSync();
        assert.ok(err);
        assert.ok(!err.errors['name']);
        assert.ok(!err.errors['password']);
        assert.equal(err.errors.email.message, user.email + ' is not valid email');
        return done();
    });

    it('check invalid password', (done) => {
        const data = {
            name: validUsername,
            email: validEmail,
            password: invalidPassword
        };
        const user = new User(data);
        const err = user.validateSync();
        assert.ok(err);
        assert.ok(!err.errors['name']);
        assert.ok(!err.errors['email']);
        assert.equal(
            err.errors.password.message,
            'password must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?');
        return done();
    });

    it('check all valid', (done) => {
        const data = {
            name: validUsername,
            email: validEmail,
            password: validPassword 
        };
        const user = new User(data);
        const err = user.validateSync();
        user.save();
        assert.ok(!err);
        return done();
    });
});
