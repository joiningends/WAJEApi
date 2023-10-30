const express = require('express');
const router = express.Router();
const numberController = require('../controller/recipaintnumberController');
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

router.post('/:id', upload.single('file'), numberController.uploadRecipientNumbers);
router.get('/sections/:id', numberController.getRecipientNumbersBySection);


module.exports = router;
