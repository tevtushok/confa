const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.post('/add', eventService.add);
router.post('/change', eventService.change);
router.post('/delete', eventService.delete);

module.exports = router;
