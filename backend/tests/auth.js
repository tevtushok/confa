const express = require('express'); 
const expect = require('chai').expect
const request = require('supertest');

function createApp() {
    let app = express();

    var router = express.Router();
    router.route('/').get(function(req, res) {
        return res.json({goodCall: true});
    });

    app.use(router);

    return app;
}

describe('auth api tests', function() {
    let app;
    // Called once before any of the tests in this block begin.
    before(function(done){
        app = createApp();
        app.listen(3000, function(err) {
            if (err) {return done(err)}
        done();
        });
    });
    it('/api/auth/register', function(done) {
        request(app)
            .get('http://localhost:4000/')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                if (err) { return done(err); }
                callStatus = res.body.goodCall;
                expect(callStatus).to.equal(true);
                // Done
                done();
            });
    });
    // Called after all of the tests in this block complete.
    after(function() {
        console.log("Our applicationa tests done!");
    });

});

