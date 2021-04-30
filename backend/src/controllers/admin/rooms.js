const express = require('express');
const roomService = require('../../services/admin/rooms');
const router = express.Router();


router.get('/roomsList', roomService.roomsList);
router.delete('/room/:id', roomService.deleteRoom);
router.post('/saveRooms', roomService.saveRooms);

module.exports = router;
