const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.post('/', eventService.add);
router.put('/:id', eventService.change);
router.delete('/:id', eventService.delete);
router.get('/:id', eventService.details);
// router.get('/eventList', eventService.eventList);

module.exports = router;
