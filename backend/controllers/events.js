const express = require('express');
const eventService = require('../services/event');
let router = express.Router();
// /event/add
router.post('/event', eventService.addEvent);
router.put('/event/:id', eventService.changeEvent);
router.delete('/event/:id', eventService.deleteEvent);
router.get('/event/:id', eventService.getEvent);
router.get('/list', eventService.eventList);

module.exports = router;
