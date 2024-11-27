const express = require('express');
const router = express.Router();

const eventController = require('../controller/eventController');

router.post('/', eventController.sendeventmessage);

module.exports = router;
