const express = require('express');
const roomsService = require('../services/rooms');
let router = express.Router();


router.get('/', roomsService.listRooms);

module.exports = router;
