const app = require('../../core/app.js');
const chai = require('chai');
const assert = require('chai').assert;
const request = require('supertest');
const expect = chai.expect;
const userUtils  = require('../userUtils');
const User = require('../../models/user'); 

describe('controllers/auth', () => {
    before(async () => await User.deleteMany({}));

    it('register name,email,password data empty', (done) => {
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                assert.nestedProperty(res, 'body.data.errors.name');
                assert.nestedProperty(res, 'body.data.errors.email');
                assert.nestedProperty(res, 'body.data.errors.password');
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
                assert.notNestedProperty(res, 'body.data.errors.name');
                assert.nestedProperty(res, 'body.data.errors.email');
                assert.nestedProperty(res, 'body.data.errors.password');
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
                assert.notNestedProperty(res, 'body.data.errors.name');
                assert.notNestedProperty(res, 'body.data.errors.email');
                assert.nestedProperty(res, 'body.data.errors.password');
                return done();
            });
    });

    it('register invalid email', (done) => {
        const user = {
            name: userUtils.generateValidName(),
            email: userUtils.generateInvalidEmail(),
            password: userUtils.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedProperty(res, 'body.data.errors.email');
                assert.notNestedProperty(res, 'body.data.errors.name');
                assert.notNestedProperty(res, 'body.data.errors.password');
                return done();
            });
    });

    it('register weak password', (done) => {
        const user = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
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
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.notNestedProperty(res, 'body.data.errors.name');
                assert.notNestedProperty(res, 'body.data.errors.email');
                assert.nestedProperty(res, 'body.data.errors.password');
                return done();
            });
    });

    it('register email exists', (done) => {
        const user = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
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
                        assert.nestedPropertyVal(subres, 'body.code', 1102);
                        return done();
                    });
            });
    });

    it('register ok', (done) => {
        const user = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/register')
            .set('Accept', 'application/json')
            .send(user)
            .expect((res) => {
                assert.nestedPropertyVal(res, 'body.code', 0);
            })
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
                assert.nestedPropertyVal(res, 'body.code', 1201);
                assert.nestedPropertyVal(res, 'body.message', 'Email and password is required');
                return done();
            });
    });

    it ('login invalid credentials', (done) => {
        const data = {
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        request(app)
            .post('/api/v1/auth/login')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(401, res.status);
                assert.nestedPropertyVal(res, 'body.code', 1202);
                assert.nestedPropertyVal(res, 'body.message', 'Invalid credentials');
                return done();
            });
    });

    it('login ok', (done) => {
        const user = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
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
    
    it('logout success', async () => {
        const agent = request.agent(app);
        const userData = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };

        const registerUser = await agent.post('/api/v1/auth/register')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        const loginUser = await agent.post('/api/v1/auth/login')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        const logoutUser = await agent.post('/api/v1/auth/logout')
            .send()
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        assert.equal(201, logoutUser.status);
        assert.nestedPropertyVal(logoutUser, 'body.code', 0);
    });

    it('verify disabled user', async () => {
        const agent = request.agent(app);
        const userData = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        const registerUser = await agent.post('/api/v1/auth/register')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        const loginUser = await agent.post('/api/v1/auth/login')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);
        await User.findOneAndUpdate({email: userData.email}, {$set: {status: 'disabled'}});

        const verifyUser = await agent.get('/api/v1/auth/verify')
            .send()
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        assert.equal(401, verifyUser.status);
        assert.nestedPropertyVal(verifyUser, 'body.code', 1402);
    });

    it('verify success', async () => {
        const agent = request.agent(app);
        const userData = {
            name: userUtils.generateValidName(),
            email: userUtils.generateValidEmail(),
            password: userUtils.generateValidPassword(),
        };
        const registerUser = await agent.post('/api/v1/auth/register')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        const loginUser = await agent.post('/api/v1/auth/login')
            .send(userData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        const verifyUser = await agent.get('/api/v1/auth/verify')
            .send()
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        assert.equal(200, verifyUser.status);
    });
});
