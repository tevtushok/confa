const authController = require('../../controllers/auth');
const usersController = require('../../controllers/users')

const express = require('express');
let router = express.Router();
router.use('/auth', authController);
router.use('/users', usersController);
module.exports = router;