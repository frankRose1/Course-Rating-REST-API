const express = require('express');
const router = express.Router();
const userHandlers = require('../handlers/userHandlers');

//all routes are prepended with "/api"

router.get('/users', userHandlers.getUser);
router.post('/users', userHandlers.createUser);

module.exports = router;