const express = require('express');
const router = express.Router();


// client controllers/////////////////
const authController = require('../../controllers/auth');
const usersController = require('../../controllers/users')
const scheduleController = require('../../controllers/schedule')
const roomsController = require('../../controllers/rooms')

router.use('/auth', authController);
router.use('/users', usersController);
router.use('/schedule', scheduleController);
router.use('/rooms', roomsController);


module.exports = router;
