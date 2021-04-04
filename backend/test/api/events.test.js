const mongoose = require('mongoose');
const app = require('../../core/app.js');
const request = require('supertest');
const { expect, assert } = require('chai');
const Event = require('../../models/event');
const Room = require('../../models/room');
const { createAndLoginUser } = require('../userUtils');
const { createRoom } = require('../roomUtils');
const { generateValidEventData } = require('../eventUtils');

describe('controllers/events', async () => {
    const agent = request.agent(app);
    let globalUser = null;
    let globalRoomActive = null;
    let globalRoomInActive = null;

    before(async () => {
        await Event.deleteMany({});
        await Room.deleteMany({});
        globalUser = await createAndLoginUser(agent);
        globalRoomActive = await createRoom();
        globalRoomInActive = await createRoom('closed');
        // console.log(globalRoomInActive);
        // console.log(globalUser);
    });

    it('add() -> title is required', (done) => {
        agent.post('/api/v1/events/add')
            .send({})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.title');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> title len < 3', (done) => {
        agent.post('/api/v1/events/add')
            .send({title: 'tq'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.title');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> roomId is invalid', (done) => {
        agent.post('/api/v1/events/add')
            .send({roomId: 'id1'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.roomId');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> roomId not found', (done) => {
        const eventData = generateValidEventData();
        eventData.roomId = mongoose.Types.ObjectId();
        agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedPropertyVal(res, 'body.code', 1102);
                assert.nestedPropertyVal(res, 'body.message', 'Room does not exists');
                return done();
            });
    });

    it('add() -> room is not active', (done) => {
        const eventData = generateValidEventData();
        eventData.roomId = globalRoomInActive.id;
        agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedPropertyVal(res, 'body.code', 1103);
                assert.nestedPropertyVal(res, 'body.message', 'Room is not active');
                return done();
            });
    });

    it('add() -> invalid date_start, date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.roomId = globalRoomActive.id;
        eventData['date_start'] = 'y2020-10-10';
        eventData['date_end'] = '02 2021 12:25';
        agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.date_start');
                assert.nestedProperty(res, 'body.data.errors.date_end');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> date_start == date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.roomId = globalRoomActive.id;
        eventData['date_end'] = eventData['date_start'];
        agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.date_end');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() -> date_start > date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.roomId = globalRoomActive.id;
        const date_end = new Date(eventData['date_start']);
        date_end.setMinutes(date_end.getMinutes() - 11);
        eventData['date_end'] = date_end;
        agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.date_end');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add() dates is crossed ', async () => {
        // be sure Events is empty
        await Event.deleteMany({});
        const eventData = generateValidEventData();
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData['title'] = 'event1';
        eventData.roomId = globalRoomActive.id;
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        eventData['title'] = 'event2';
        eventData['date_start'] = new Date('2021 11:00');
        eventData['date_end'] = new Date('2021 12:00');
        const event2 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        const event3 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);

        eventData['date_start'] = new Date('2021 09:00');
        eventData['date_end'] = new Date('2021 10:00');
        eventData['title'] = 'event4';
        const event4 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201);

        eventData['date_start'] = new Date('2021 09:00');
        eventData['date_end'] = new Date('2021 10:01');
        eventData['title'] = 'event4';
        const event5 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.nestedPropertyVal(event5, 'body.code', 1104);
        assert.nestedPropertyVal(event5, 'body.message', 'Date is crossed with other event');
        assert.notEmpty(event5, 'body.data.events');
        assert.isArray(event5.body.data.events);
        assert.equal(2, event5.body.data.events.length);

        eventData['date_start'] = new Date('2021 09:30');
        eventData['date_end'] = new Date('2021 13:00');
        eventData['title'] = 'event6';
        const event6 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.nestedPropertyVal(event6, 'body.code', 1104);
        assert.nestedPropertyVal(event6, 'body.message', 'Date is crossed with other event');
        assert.notEmpty(event6, 'body.data.events');
        assert.isArray(event6.body.data.events);
        assert.equal(3, event6.body.data.events.length);
    });
});
