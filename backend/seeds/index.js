const faker = require('faker');
const Room = require('../models/room.js');
const mongoose = require('mongoose');
const path = require('path')
const parentDir = path.resolve(__dirname, '..');
require('dotenv').config({
    path: path.resolve(parentDir, '.env'),
})

mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const firstNumber = 400;
startFake();
//dup();
// del();
//ddx()
async function startFake() {
    for(let i = 0; i < 13; i++) {
        let titleArra = faker.name.jobTitle().split(' ');
        titleArra.pop();
        const title = titleArra.join(' ')
        const number = faker.random.number();
        const status = 0;
        const room = {
            title: title,
            number: firstNumber + i,
            status: 'ACTIVE',
        };
        console.log('trying to save in db')

        await Room.create(room, (err, room) => {
            if (err) {
                console.log('error while saving room', room);
                console.log(err);
            }
            else {
                console.log('room saved', room);
            }
        });

    }
}
function jsonResponse(message, data) {
    console.log('jsonResponse');
    console.log(message, data);
}
function handleError(err) {
    console.log('handleError');
    console.log(err.code)
    console.log(err);
}
async function dup() {
    const code = 11;
    const roomId = '5f6c94d08fe62d500395a541';
    const room = {
        number: 400,
    }
    const response = {};
    const error = {};
    Room.findOneAndUpdate({_id: roomId}, room)
        .then(room => {
            jsonResponse('ok', room);
        }, (err) => {
            if (11000 === err.code) {
                return jsonResponse('duplicate key', {code: err.code, message: err.message});
            }
            return handleError(err);
        });

    return jsonResponse('unknow error', {});
}

function del() {
    const id = '5f6c94d08fe62d500395a543'
    Room.findOneAndDelete({_id: id})
    .then(room => {
        console.log('deleted', room)
    })
    .catch(err => {
        console.log('catch', err)
    });
}

async function ddx() {
    const rooms = Room.getAvailable((err, rooms) => {
        console.log(rooms)
    });
}
