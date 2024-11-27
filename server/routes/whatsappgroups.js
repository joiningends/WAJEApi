const express = require('express');
const router = express.Router();
const wagroupController = require('../controller/whatsappgroupController');
const authMiddleware = require('../middlewares/authMiddleware');



router.post('/:id',authMiddleware, wagroupController.createWhatsAppGroup);
router.get('/getbyuserid/:id',authMiddleware, wagroupController.getWhatsAppGroupsByUserId);

router.put('/:id',authMiddleware, wagroupController.updateWhatsAppGroup);
router.put('/active/:id',authMiddleware, wagroupController.updateSectionactive);
router.get('/active/:userId',authMiddleware,wagroupController.getAllActiveSections);
router.get('/whatsapp-group/:id',authMiddleware, wagroupController.getWhatsAppGroupById);
module.exports = router;
