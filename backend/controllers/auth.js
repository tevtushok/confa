const express = require('express');
const authService = require('../services/auth');
let router = express.Router();


router.post('/register', authService.register);
router.post('/login', authService.login);
router.post('/logout', authService.logout);
router.get('/verify', authService.verify);

//router.post('/verifyToken', authService.verifyToken);

module.exports = router;
