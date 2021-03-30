const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.get('/eventList', eventService.eventList);

module.exports = router;
