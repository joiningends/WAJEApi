const express = require('express');
const router = express.Router();
const numberController = require('../controller/recipaintnumberController');
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

router.post('/:id', upload.single('file'), authMiddleware, numberController.uploadRecipientNumbers);
router.get('/sections/:id', authMiddleware, numberController.getRecipientNumbersBySection);
router.put('/:id/contact/:contactId', authMiddleware, numberController.updateContactNumber);
router.delete('/:id/contact/:contactId', authMiddleware, numberController.deleteContactNumber);


module.exports = router;
