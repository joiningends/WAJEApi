const express = require('express');
const router = express.Router();
const waController = require('../controller/waController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({ storage: storage });
router.post('/',authMiddleware, waController.sendBulkWhatsAppMessages);
router.get('/',authMiddleware, waController.getSentWhatsAppMessages);
router.post('/media',upload.single('file'), authMiddleware, waController.sendMediaMessage);

router.post('/instanceid/:accetoken',authMiddleware, waController.createInstance);
router.post('/qr/:instanceid/:accetoken',authMiddleware, waController.getQRCode);
router.post('/stop/stopthecampain',authMiddleware, waController.stop);
router.post('/send', waController.sendBulkWhatsAppMessagess);
router.post('/send/media', waController.sendBulkWhatsAppMessagesMedia);
router.post('/group/:id', waController.sendTextMessageToGroup);
router.post('/groups/:id',  waController.sendMediaMessageToGroup);
router.post('/sends',  waController.sendTextMessage);
router.get('/download-messages/:campainid',  waController.downloadexcel);
router.post('/api', waController.sendBulkWhatsAppMessagesapi);
router.post('/api/media', waController.sendBulkWhatsAppMessagesMediaapi);
router.post('/api/single', waController.sendSingleWhatsAppMessageapi);
router.post('/api/media/single', waController.sendSingleWhatsAppMessageMediaapi);
router.get('/downloadcsv/:clientid', waController.downloadexcelapi);
router.post('/api/instanceid', waController.createInstanceapi);
router.post('/api/qr/:instanceid', waController.getQRCodeapi);
router.get('/params/single', waController.sendSingleWhatsAppMessageapiparam);
module.exports = router;
