const express = require('express');
const v1Api = require('./v1');
let router = express.Router();
router.get('/v1', (req, res, next) => {
	res.sendFile(__dirname + '/index.html');
});
router.use('/v1', v1Api);

module.exports = router;
