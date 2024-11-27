const express = require('express');
const router = express.Router();
const eidispatchDetailsController = require('../controller/eidispatchDetailsController');

const authMiddleware = require('../middlewares/authMiddleware');
router.post('/',authMiddleware, eidispatchDetailsController.createEidispatchDetail);


router.get('/by/:id',authMiddleware, eidispatchDetailsController.getAllEidispatchDetails);


router.get('/:id', authMiddleware, eidispatchDetailsController.getEidispatchDetailById);


router.put('/:id', authMiddleware, eidispatchDetailsController.updateEidispatchDetailById);


router.delete('/:id', authMiddleware, eidispatchDetailsController.deleteEidispatchDetailById);

module.exports = router;
