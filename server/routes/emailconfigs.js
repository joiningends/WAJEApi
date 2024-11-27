const express = require('express');
const router = express.Router();
const emailConfigController = require('../controller/emailconfigController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:clientId', authMiddleware, emailConfigController.createEmailConfig);


router.get('/:clientId', authMiddleware, emailConfigController.getEmailConfigByClientId);


router.get('/getbyid/:id', authMiddleware, emailConfigController.getEmailConfigById);


router.put('/:id', emailConfigController.updateEmailConfig);


router.delete('/:id', emailConfigController.deleteEmailConfig);
router.post('/send/email/testing', emailConfigController.sendEmail);

module.exports = router;
