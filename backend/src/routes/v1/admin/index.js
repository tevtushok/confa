const express = require('express');
const v1Api = require('./v1.js');
const router = express.Router();
const { jsonResponse } = require('../../../includes/utils');

router.get('/v1', (req, res, next) => {
    res.sendFile(__dirname + '/index.html');
});

function adminMiddleware (req, res, next) {
    console.log(req.user);
	if (!req.user || !req.user.isAdmin) {
		return jsonResponse(req, res, 403, null, null, 'Access restricted');
	}
	next();
}
router.use(adminMiddleware);

router.use('/v1', v1Api);

module.exports = router;
