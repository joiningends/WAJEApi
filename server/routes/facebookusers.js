const express = require('express');
const facebookController = require('../controller/facebookuserController');
const router = express.Router();


router.post('/facebook-login', facebookController.facebooklogin);

router.post('/sendmessage', facebookController.sendWhatsAppMessageusingcloudap);


module.exports = router;
