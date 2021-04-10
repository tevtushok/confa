const mongoose = require('mongoose');
const app = require('../../core/app.js');
const request = require('supertest');
const { expect, assert } = require('chai');
const Event = require('../../models/event');
const Room = require('../../models/room');
const User = require('../../models/user');
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
        await User.deleteMany({});
        globalUser = await createAndLoginUser(agent);
        globalRoomActive = await createRoom();
        globalRoomInActive = await createRoom('closed');
        // console.log(globalRoomInActive);
        // console.log(globalUser);
    });

    it('add, title is required', (done) => {
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

    it('add, title len < 3', (done) => {
        agent.post('/api/v1/events/add') .send({title: 'tq'})
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

    it('add, description is required', (done) => {
        agent.post('/api/v1/events/add')
            .send({})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.description');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add, room is invalid', (done) => {
        agent.post('/api/v1/events/add')
            .send({room: 'id1'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err) return done(err);
                assert.equal(401, res.status);
                assert.nestedProperty(res, 'body.data.errors.room');
                assert.nestedPropertyVal(res, 'body.code', 1101);
                assert.nestedPropertyVal(res, 'body.message', 'Validation error');
                return done();
            });
    });

    it('add, room not found', (done) => {
        const eventData = generateValidEventData();
        eventData.room = mongoose.Types.ObjectId();
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

    it('add, room is not active', (done) => {
        const eventData = generateValidEventData();
        eventData.room = globalRoomInActive.id;
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

    it('add, invalid date_start, date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.room = globalRoomActive.id;
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

    it('add, date_start == date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.room = globalRoomActive.id;
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

    it('add, date_start > date_end', (done) => {
        const eventData = generateValidEventData();
        eventData.room = globalRoomActive.id;
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

    it('add', async () => {
        // be sure Events is empty
        await Event.deleteMany({});
        const eventData = generateValidEventData();

        // 10:00-11:00 event1
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData['title'] = 'event1';
        eventData.room = globalRoomActive.id;
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event1.status);

        // 11:00-12:00 event2
        eventData['title'] = 'event2';
        eventData['date_start'] = new Date('2021 11:00');
        eventData['date_end'] = new Date('2021 12:00');
        const event2 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event2.status);


        // 12:00-12:00 crossed with above event3
        const event3 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, event3.status);

        // 09:00-10:00 event4
        eventData['date_start'] = new Date('2021 09:00');
        eventData['date_end'] = new Date('2021 10:00');
        eventData['title'] = 'event4';
        const event4 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event4.status);

        eventData['date_start'] = new Date('2021 09:00');
        eventData['date_end'] = new Date('2021 10:01');
        eventData['title'] = 'event4';
        const event5 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, event5.status);
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
        assert.equal(401, event6.status);
        assert.nestedPropertyVal(event6, 'body.code', 1104);
        assert.nestedPropertyVal(event6, 'body.message', 'Date is crossed with other event');
        assert.notEmpty(event6, 'body.data.events');
        assert.isArray(event6.body.data.events);
        assert.equal(3, event6.body.data.events.length);
        // 3 events already in db
        // 09:00-10:00 event4 // 10:00-11:00 event1 // 11:00-12:00 event2

    });

    it('add same time but differant room', async () => {
        await Event.deleteMany({});
        const eventData = generateValidEventData();

        // 10:00-11:00 event1
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData['title'] = 'event1';
        eventData.room = globalRoomActive.id;
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event1.status);

        const room2 = await createRoom();
        const room2EventData = {
            room: room2['_id'],
            title: 'room2event title',
            description: 'room2event description',
            date_start: event1.body.data.event.date_start,
            date_end: event1.body.data.event.date_end,
        };
        const event2 = await agent.post('/api/v1/events/add')
            .send(room2EventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event2.status);
    });

    it('change', async() => {
        // be sure Events is empty
        await Event.deleteMany({});
        // go create 3 events
        // 09:00-10:00 event1 // 10:00-11:00 event2 // 11:00-12:00 event3
        let eventData = null;
        let changeData = null;

        // 09:00-10:00 event1
        eventData = generateValidEventData(globalRoomActive.id);
        eventData['date_start'] = new Date('2021 09:00');
        eventData['date_end'] = new Date('2021 10:00');
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event1.status);

        // 10:00-11:00 event1
        eventData = generateValidEventData(globalRoomActive.id);
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData.room = globalRoomActive.id;
        const event2 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event2.status);

        // 11:00-12:00 event3
        eventData = generateValidEventData(globalRoomActive.id);
        eventData['date_start'] = new Date('2021 11:00');
        eventData['date_end'] = new Date('2021 12:00');
        const event3 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event3.status);

        // 3 events createted
        // 09:00-10:00 event1 // 10:00-11:00 event2 // 11:00-12:00 event3


        changeData = {
            '_id': event3.body.data.event._id,
            title: '',
            description: '',
        }
        const reqFieldsErr = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, reqFieldsErr.status);
        assert.nestedProperty(reqFieldsErr, 'body.data.errors.title');
        assert.nestedProperty(reqFieldsErr, 'body.data.errors.description');
        assert.nestedPropertyVal(reqFieldsErr, 'body.code', 1101);
        assert.nestedPropertyVal(reqFieldsErr, 'body.message', 'Validation error');

        changeData.description = 'qq';
        const shortTitleErr = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, shortTitleErr.status);
        assert.nestedProperty(shortTitleErr.body, 'data.errors.title');
        assert.notNestedProperty(shortTitleErr.body, 'data.errors.description');
        assert.nestedPropertyVal(shortTitleErr.body, 'code', 1101);
        assert.nestedPropertyVal(shortTitleErr.body, 'message', 'Validation error');

        changeData = {
            title: 'event title',
            description: 'event description',
        }
        const eventIdErr = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, eventIdErr.status);
        assert.nestedPropertyVal(eventIdErr.body, 'code', 1107);
        assert.nestedPropertyVal(eventIdErr.body, 'message', 'Event id is required');

        changeData = {
            '_id': event3.body.data.event._id,
            title: 'eve',
            description: 'event description',
        }
        const eventIdErrOk = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, eventIdErrOk.status);

        changeData = {
            '_id': event3.body.data.event._id,
            title: 'eve',
            description: 'event description',
        }
        const ok1 = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, ok1.status);

        changeData = {
            '_id': event3.body.data.event._id,
            // change 11:00 to 09.30 and it will be crossed with events 1,2
            date_start: new Date('2021 09:00'),
        }

        const crossed1 = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, crossed1.status);
        assert.equal(2, crossed1.body.data.events.length);

        changeData = {
            '_id': event3.body.data.event._id,
            // change 10:00 to 09.30 and it will be crossed with events 1,2
            date_start: new Date('2021 09:30'),
        }
        const crossed2 = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, crossed2.status);
        assert.equal(2, crossed2.body.data.events.length);

        changeData = {
            '_id': event3.body.data.event._id,
            // change 11:00 to 10:00 and it will be crossed with event2
            date_start: new Date('2021 10:00'),
        }
        // eventData['date_end'] = new Date('2021 10:00');
        const crossed3 = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(401, crossed3.status);
        assert.equal(1, crossed3.body.data.events.length);

        changeData = {
            '_id': event3.body.data.event._id,
            // change 11:00 to 10:00 and it will be crossed with event2
            date_end: new Date('2021 13:00'),
        }
        const crossed4 = await agent.post('/api/v1/events/change')
            .send(changeData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, crossed4.status);
    }); // 3 events createted // 09:00-10:00 event1 // 10:00-11:00 event2 // 11:00-12:00 event3

    it('delete', async () => {
        await Event.deleteMany({});
        const eventData = generateValidEventData();


        // 10:00-11:00 event1
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData['title'] = 'event1';
        eventData.room = globalRoomActive.id;
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event1.status);

        const delete1 = await agent.post('/api/v1/events/delete')
            .send({'_id': event1.body.data.event._id})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, delete1.status);
    });

    it('delete not own event', async () => {
        await Event.deleteMany({});
        const eventData = generateValidEventData();

        // 10:00-11:00 event1
        eventData['date_start'] = new Date('2021 10:00');
        eventData['date_end'] = new Date('2021 11:00');
        eventData['title'] = 'event1';
        eventData.room = globalRoomActive.id;
        const event1 = await agent.post('/api/v1/events/add')
            .send(eventData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.equal(201, event1.status);

        user2 = await createAndLoginUser(agent); // login to another user

        const delete1 = await agent.post('/api/v1/events/delete')
            .send({'_id': event1.body.data.event._id})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        assert.nestedPropertyVal(delete1, 'body.code', 1106);
        assert.nestedPropertyVal(delete1, 'body.message', 'This event does not belong to you');
        assert.equal(401, delete1.status);
    });
});
