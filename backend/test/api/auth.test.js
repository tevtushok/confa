const app = require('../../core/app.js');
const chai = require('chai');
const assert = require('chai').assert;
const request = require('supertest');
const expect = chai.expect;
const userGenerator  = require('../userGenerator');
const User = require('../../models/user'); 



describe('controllers/auth', () => {
    before(async () => await User.deleteMany({}));
    // router.post('/login', authService.login);
    // router.post('/logout', authService.logout);
    // router.get('/verify', authService.verify); 

    it('register name,email,password data empty', (done) => {
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.data.errors).to.have.property('name');
                expect(res.body.data.errors).to.have.property('email');
                expect(res.body.data.errors).to.have.property('password');
                return done();
            });
    });

    it('register email, password empty', (done) => {
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send({ name: 'valid_username' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.data.errors).to.not.have.property('name');
                expect(res.body.data.errors).to.have.property('email');
                expect(res.body.data.errors).to.have.property('password');
                return done();
            });
    });

    it('register password empty', (done) => {
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send({
                name: 'valid_username',
                email: 'valid@e.mail',
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.data.errors).to.not.have.property('name');
                expect(res.body.data.errors).to.not.have.property('email');
                expect(res.body.data.errors).to.have.property('password');
                return done();
            });
    });

    it('register invalid email', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateInvalidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.code).to.be.equal(101);
                expect(res.body.data.errors).to.not.property('name');
                expect(res.body.data.errors).to.not.property('password');
                expect(res.body.data.errors).to.have.property('email');
                return done();
            });
    });

    it('register weak password', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: 'weekpass',
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err){ 
                    return done(err);
                }
                expect(res.body.code).to.be.equal(101);
                expect(res.body.data.errors).to.have.property('password');
                expect(res.body.data.errors).to.not.have.property('name');
                expect(res.body.data.errors).to.not.have.property('email');
                return done();
            });
    });

    it('register email exists', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        const response = request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                request(app)
                    .post('/api/v1/auth/register')
                    .set('Accept', 'application/json')
                    .send(user)
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end((suberr, subres) => {
                        if (suberr) {
                            return done(suberr);
                        }
                        expect(subres.body.code).to.be.equal(102);
                        return done();
                    });
            });
    });

    it('register ok', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect(201, done);
    });

    it ('login empty credentials', (done) => {
        request(app)
            .post('/api/v1/auth/login')
            .send({})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(400, res.status);
                assert.equal('Email and password is required', res.body.message);
                assert.equal(201, res.body.code);
                return done();
            });
    });

    it ('login invalid credentials', (done) => {
        const data = {
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/login')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(401, res.status);
                assert.equal('Invalid credentials', res.body.message);
                assert.equal('202', res.body.code);
                return done();
            });
    });

    it('login ok', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(201, res.status);
                request(app)
                    .post('/api/v1/auth/login')
                    .send({email: user.email, password: user.password})
                    .set('Accept', 'application/json')
                    .expect(201, done);
            });
    });
    it('logout', (done) => {
        const user = {
            name: userGenerator.generateValidName(),
            email: userGenerator.generateValidEmail(),
            password: userGenerator.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(201, res.status);
                request(app)
                    .post('/api/v1/auth/login')
                    .send({email: user.email, password: user.password})
                    .set('Accept', 'application/json')
                    .end((err, res) => {
                        if (err) return done(err);
                        assert.equal(201, res.status);
                        assert.nestedProperty(res, 'body.data.token');
                        assert.ok(res.body.data.token.length);
                        const token = res.body.data.token;
                        request(app)
                            .post('/api/v1/auth/logout')
                            .send({token: token})
                            .set('Cookie', ['token=' + token])
                            .set('token', token)
                            .set('Accept', 'application/json')
                            .end((err, res) => {
                                if (err) return done(err);
                                console.log(res.body);
                                assert.equal(201, res.status);
                                return done();
                            });
                    });
            });
    });
});
