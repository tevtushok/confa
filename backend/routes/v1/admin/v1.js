const express = require('express');
const router = express.Router();

// admin controllers////////////////////////////////////////////////////////
const adminRoomController = require('../../../controllers/admin/rooms')

router.use('/rooms/', adminRoomController)


module.exports = router;