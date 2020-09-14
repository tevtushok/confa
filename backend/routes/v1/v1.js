const authController = require('../../controllers/auth');

const express = require('express');
let router = express.Router();
router.use('/auth', authController);
module.exports = router;
