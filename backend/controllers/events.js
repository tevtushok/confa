const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.post('/', eventService.add);
router.post('/change', eventService.change);
router.delete('/:id', eventService.delete);
router.get('/details/:id', eventService.details);
router.get('/eventList', eventService.eventList);

module.exports = router;
