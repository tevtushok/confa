const assert = require('chai').assert;
const User = require('../../models/user.js');
const userUtils = require('../userUtils');
const bcrypt = require('bcryptjs');

describe('models/user', async () => {

    const validUsername = userUtils.generateValidName();
    const invalidUsername = userUtils.generateInvalidName();

    const validEmail = userUtils.generateValidEmail();
    const invalidEmail = userUtils.generateInvalidEmail();

    const validPassword = userUtils.generateValidPassword();
    const invalidPassword = userUtils.generateInvalidPassword();

    it('check status', (done) => {
        let err = new User({status: 'quo'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.status.message', 'status is not valid enum value');

        err = new User({status: 'enabled'}).validateSync();
        assert.notNestedProperty(err, 'errors.status');

        err = new User({status: 'disabled'}).validateSync();
        assert.notNestedProperty(err, 'errors.status');

        return done();
    });

    it('check username', (done) => {
        let err = null;

        err = new User().validateSync();
        assert.nestedPropertyVal(err, 'errors.name.message', 'name is required');

        err = new User({name: 'nq'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.name.message', 'name should starts with letter, and contain minimum 3 character');

        err = new User({name: '1nameuser'}).validateSync();
        assert.nestedPropertyVal(err, 'errors.name.message', 'name should starts with letter, and contain minimum 3 character');

        err = new User({name: 'qu2ser'}).validateSync();
        assert.notNestedProperty(err, 'errors.name');

        return done();
    });

    it('check email', (done) => {
        let err, invalidEmail = userUtils.generateInvalidEmail();

        err = new User().validateSync();
        assert.nestedPropertyVal(err, 'errors.email.message', 'email is required');

        err = new User({email: invalidEmail}).validateSync();
        assert.nestedPropertyVal(err, 'errors.email.message', `${invalidEmail} is not valid email`);

        invalidEmail = 'email@invalid';
        err = new User({email: invalidEmail}).validateSync();
        assert.nestedPropertyVal(err, 'errors.email.message', `${invalidEmail} is not valid email`);

        err = new User({email: userUtils.generateValidEmail()}).validateSync();
        assert.notNestedProperty(err, 'errors.email.message');

        return done();
    });

    it('check duplicate email', (done) => {
        const data = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        const user = new User(data);
        user.save((err, res) => {
            if (err) return done(err);
            const dupUser = new User(data);
            dupUser.save((err, res) => {
                assert.ok(err);
                assert.equal(err.code, 11000); // MongoError: E11000 duplicate key error dup key
                assert.equal(err.name, 'MongoError');
                return done();
            });
        });
    });

    it('check password', (done) => {
        let err = null;

        err = new User({}).validateSync();
        assert.nestedPropertyVal(err, 'errors.password.message', 'password is required');

        err = new User({password: 'weak password'}).validateSync(); 
        assert.nestedPropertyVal(err,
            'errors.password.message',
            'password must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?');

        err = new User({password: 'weakPass#'}).validateSync(); 
        assert.nestedPropertyVal(err,
            'errors.password.message',
            'password must contain 8 characters and at least one number, one letter and one unique character such as !#$%&?');

        err = new User({password: 'weakPass#1'}).validateSync(); 
        assert.notNestedProperty(err, 'errors.password');

        return done();
    });

    it('check password is crypted', (done) => {
        const data = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword() 
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

    it('check authenticate failed', (done) => {
        const data = {
            name: validUsername,
            email: validEmail,
            password: validPassword 
        };
        const user = new User(data);
        const err = user.validateSync();
        assert.ok(!err);
        const newEmail = userUtils.generateValidEmail();
        user.save((err, res) => {
            if (err) return done(err);
            User.authenticate(newEmail, data.password, (authErr, authRes) => {
                assert.ok(authErr);
                assert.equal(authErr.code, 401);
                assert.equal(authErr.message, 'Email not found');
            });

            User.authenticate(data.email, userUtils.generateValidPassword, (authErr, authRes) => {
                assert.ok(authErr);
                assert.equal(authErr.code, 401);
                assert.equal(authErr.message, 'Authentication failed');

                return done();
            });
        });
    });

    it('check authenticate succes', (done) => {
        const data = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        const user = new User(data);
        const err = user.validateSync();
        assert.ok(!err);
        user.save((err, res) => {
            if (err) return done(err);
            User.authenticate(data.email, data.password, (authErr, authRes) => {
                assert.ok(!authErr);
                return done();
            });
        });
    });

});
