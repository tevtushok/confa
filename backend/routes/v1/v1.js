const express = require('express');
const router = express.Router();


// client controllers/////////////////
const authController = require('../../controllers/auth');
const usersController = require('../../controllers/users')

router.use('/auth', authController);
router.use('/users', usersController);


module.exports = router;