const express = require('express');
const router = express.Router();
const eiBuyerDetailsController = require('../controller/eibuyerdetailsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, eiBuyerDetailsController.createEiBuyerDetail);


router.get('/by/:id', authMiddleware, eiBuyerDetailsController.getAllEiBuyerDetails);


router.get('/:id', authMiddleware, eiBuyerDetailsController.getEiBuyerDetailById);


router.put('/:id',authMiddleware, eiBuyerDetailsController.updateEiBuyerDetailById);


router.delete('/:id', authMiddleware, eiBuyerDetailsController.deleteEiBuyerDetailById);

module.exports = router;
