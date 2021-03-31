const assert = require('assert');
const User = require('../../models/user.js');
const userGenerator = require('../userGenerator');
const bcrypt = require('bcryptjs');

describe('models/user', async () => {

    const validUsername = userGenerator.generateValidName();
    const invalidUsername = userGenerator.generateInvalidName();

    const validEmail = userGenerator.generateValidEmail();
    const invalidEmail = userGenerator.generateInvalidEmail();

    const validPassword = userGenerator.generateValidPassword();
    const invalidPassword = userGenerator.generateInvalidPassword();

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

    it('check duplicate email', (done) => {
        const data = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        const user = new User(data);
        user.save((err, res) => {
            if (err) return done(err);
            assert.ok(!err);
            const dupUser = new User(data);
            dupUser.save((err, res) => {
                assert.ok(err);
                assert.equal(err.code, 11000); // MongoError: E11000 duplicate key error dup key
                assert.equal(err.name, 'MongoError');
                return done();
            });
        });
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

    it('check authenticate failed', (done) => {
        const data = {
            name: validUsername,
            email: validEmail,
            password: validPassword 
        };
        const user = new User(data);
        const err = user.validateSync();
        const newEmail = userGenerator.generateValidEmail();
        user.save((err, res) => {
            if (err) return done(err);
            assert.ok(!err);
            User.authenticate(newEmail, data.password, (authErr, authRes) => {
                assert.ok(authErr);
                assert.equal(authErr.code, 401);
                assert.equal(authErr.message, 'Email not found');
            });

            User.authenticate(data.email, userGenerator.generateValidPassword, (authErr, authRes) => {
                assert.ok(authErr);
                assert.equal(authErr.code, 401);
                assert.equal(authErr.message, 'Authentication failed');

                return done();
            });
        });
    });

    it('check authenticate succes', (done) => {
        const data = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        const user = new User(data);
        const err = user.validateSync();
        user.save((err, res) => {
            if (err) return done(err);
            assert.ok(!err);
            User.authenticate(data.email, data.password, (authErr, authRes) => {
                assert.ok(!err);
                return done();
            });
        });
    });

    it('check password is crypted', (done) => {
        const data = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword() 
        };
        const user = new User(data);
        const err = user.validateSync();
        user.save((err, res) => {
            if (err) return done(err);
            assert.ok(!err);
            bcrypt.compare(data.password, user.password, function (bcryptErr, bcryptRes) {
                assert.ok(bcryptRes);
            });
            return done();
        });
    });
});
