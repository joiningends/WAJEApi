const express = require('express');
const router = express.Router();
const messageController = require('../controller/groupController');

// Route for tracking a message
router.post('/track-message', messageController.trackMessage);
router.delete('/', messageController.deleteAllMessages);

module.exports = router;
