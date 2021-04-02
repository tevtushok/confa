const app = require('../../core/app.js');
const request = require('supertest');
const { expect, assert } = require('chai');
const { createAndLoginUser } = require('../userUtils');
const { createRoom } = require('../roomUtils');
const Event = require('../../models/event'); 
const Room = require('../../models/room'); 

describe('controllers/events', async () => {
    const agent = request.agent(app);
    let globalUser = null;
    let globalRoom = []; 

    before(async () => {
        await Room.deleteMany({});
        globalUser = await createAndLoginUser(agent);
        globalRoom = await createRoom(); 
        console.log(globalRoom);
        // console.log(globalRooms);
        // console.log(globalUser);
    });

    beforeEach(async () => {
        await Event.deleteMany({});
    });

    const getValidEventData = () => {
    };

    it('add() -> roomId is invalid', (done) => {
        agent.post('/api/v1/events/add')
            .send({roomId: 'id1'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.roomId');
                assert.nestedPropertyVal(res, 'body.code', 1501);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> roomId not found', (done) => {
        agent.post('/api/v1/events/add')
            .send({roomId: 'id1'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.roomId');
                assert.nestedPropertyVal(res, 'body.code', 1501);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });
    // Event({roomId: mongoose.Types.ObjectId()}).validateSync();
});
