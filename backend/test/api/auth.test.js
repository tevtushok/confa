const assert = require('assert');
const app = require('../../core/app.js');
const chai = require('chai');
const request = require('supertest');
const expect = chai.expect;
const userGenerator  = require('../userGenerator');
const User = require('../../models/user'); 


after(async () => await User.deleteMany({}));

describe('controllers/auth', () => {
    // router.post('/register', authService.register);
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
            email: userGenerator.generateInValidEmail(),
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
});
