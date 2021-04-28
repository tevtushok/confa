const express = require('express');
const roomsService = require('../services/rooms');
let router = express.Router();


router.get('/list', roomsService.list);
router.get('/roomsWithEventsOfDay/:date', roomsService.roomsWithEventsOfDay);

module.exports = router;
