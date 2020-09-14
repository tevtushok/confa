const express = require('express');
const usersService = require('../services/users');
let router = express.Router();


router.get('/', usersService.me);

module.exports = router;