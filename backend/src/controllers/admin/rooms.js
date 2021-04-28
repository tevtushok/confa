const express = require('express');
const roomService = require('../../services/admin/rooms');
const router = express.Router();


router.get('/', roomService.listRooms);
router.delete('/:id', roomService.deleteRoom);
router.post('/', roomService.saveRooms);

module.exports = router;
