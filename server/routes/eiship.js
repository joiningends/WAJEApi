const express = require('express');
const router = express.Router();
const eishipDetailsController = require('../controller/eishipController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, eishipDetailsController.createEishipDetail);


router.get('/by/:id',authMiddleware, eishipDetailsController.getAllEishipDetails);


router.get('/:id', authMiddleware, eishipDetailsController.getEishipDetailById);


router.put('/:id', authMiddleware, eishipDetailsController.updateEishipDetailById);


router.delete('/:id', authMiddleware, eishipDetailsController.deleteEishipDetailById);

module.exports = router;
