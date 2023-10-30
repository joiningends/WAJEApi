const express = require('express');
const router = express.Router();
const waController = require('../controller/waController');
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
router.post('/', waController.sendBulkWhatsAppMessages);
router.get('/', waController.getSentWhatsAppMessages);
router.post('/media',upload.single('file'), waController.sendMediaMessage);
router.post('/group', waController.sendTextMessageToGroup);
module.exports = router;
