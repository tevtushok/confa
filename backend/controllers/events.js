const express = require('express');
const eventService = require('../services/event');
let router = express.Router();

router.post('/add', eventService.add);

module.exports = router;
