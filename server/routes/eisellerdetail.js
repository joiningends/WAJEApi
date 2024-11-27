const express = require('express');
const router = express.Router();
const EISellerDetailsController = require('../controller/eisellerdetailsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/by/:id', authMiddleware, EISellerDetailsController.getAllSellerDetails);


router.get('/:id', authMiddleware, EISellerDetailsController.getSellerDetailsById);


router.post('/', authMiddleware, EISellerDetailsController.createSellerDetails);


router.put('/:id', authMiddleware, EISellerDetailsController.updateSellerDetailsById);


router.delete('/:id', authMiddleware, EISellerDetailsController.deleteSellerDetailsById);

module.exports = router;
