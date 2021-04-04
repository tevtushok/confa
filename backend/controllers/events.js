const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.post('/add', eventService.add);
router.post('/change', eventService.change);

module.exports = router;
