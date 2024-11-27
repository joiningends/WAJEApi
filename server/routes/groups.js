const express = require('express');
const router = express.Router();
const messageController = require('../controller/groupController');
const authMiddleware = require('../middlewares/authMiddleware');
// Route for tracking a message
router.post('/track-message', messageController.trackMessage);
router.delete('/', messageController.deleteAllMessages);
router.post('/track-message/excel', messageController.trackMessageexcel);
module.exports = router;
