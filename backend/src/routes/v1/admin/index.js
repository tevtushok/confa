const express = require('express');
const router = express.Router();

const { jsonResponse } = require('../../../includes/utils');

router.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/index.html');
});

function adminMiddleware (req, res, next) {
	if (!req.user || !req.user.isAdmin) {
		return jsonResponse(req, res, 403, null, null, 'Access restricted');
	}
	next();
}

router.use(adminMiddleware);

const adminRoomController = require('../../../controllers/admin/rooms')

router.use('/rooms/', adminRoomController)


module.exports = router;
