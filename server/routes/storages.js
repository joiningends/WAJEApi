const express = require('express');
const router = express.Router();
const uploadController = require('../controller/storageController');
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

router.post('/upload/:clientid', upload.single('file'), authMiddleware, uploadController.uploadFile);
router.get('/:clientid', authMiddleware, uploadController.getStorageItemsByClientId);
router.delete('/:id/:fileId', authMiddleware, uploadController.deleteFile);
module.exports = router;
