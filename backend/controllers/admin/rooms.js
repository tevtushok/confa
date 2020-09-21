const express = require('express');
const roomService = require('../../services/admin/rooms');
const router = express.Router();


router.get('/', roomService.list);

module.exports = router;