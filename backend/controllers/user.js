const express = require('express');
const userService = require('../services/user');
let router = express.Router();


router.post('/register', userService.register);

router.post('/login', userService.login);

router.post('/logout', userService.logout);

router.post('/verifyToken', userService.verifyToken);

module.exports = router;