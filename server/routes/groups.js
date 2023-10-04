const express = require('express');
const router = express.Router();
const messageController = require('../controller/groupController');

// Route for tracking a message
router.post('/track-message', messageController.trackMessage);


module.exports = router;
