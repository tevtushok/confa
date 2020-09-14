const express = require('express');
const userService = require('../services/auth');
let router = express.Router();


router.post('/register', userService.register);

router.post('/login', userService.login);

router.post('/logout', userService.logout);

router.get('/verify', userService.verify);

//router.post('/verifyToken', userService.verifyToken);

module.exports = router;