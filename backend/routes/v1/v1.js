const express = require('express');
const router = express.Router();


// client controllers/////////////////
const authController = require('../../controllers/auth');
const usersController = require('../../controllers/users')
const eventsController = require('../../controllers/events')
const roomsController = require('../../controllers/rooms')

router.use('/auth', authController);
router.use('/events', eventsController);

router.use('/users', usersController);
router.use('/rooms', roomsController);


module.exports = router;
