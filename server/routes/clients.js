const express = require('express');
const router = express.Router();
const clientController = require('../controller/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
// Create a new campaign

router.post('/',authMiddleware, clientController.createClient);


router.get('/',authMiddleware, clientController.getAllClients);


router.get('/clients/:id', authMiddleware,clientController.getClientById);


router.put('/clients/:id',authMiddleware, clientController.updateClientById);


router.delete('/clients/:id', authMiddleware,clientController.deleteClientById);
router.get('/:id/total-sent-messages', authMiddleware,clientController.getTotalSentMessages);
router.get('/:id/messages', authMiddleware,clientController.getMessagesByDateRange);
router.get('/pdf', authMiddleware,clientController.generatePDF);
router.put('/updateTotalCredit', authMiddleware,clientController.updateTotalCredit);
router.put('/einvoice/updateTotalCredit', authMiddleware,clientController.updateTotalCrediteinvoice);
router.post('/forgot-password', clientController.forgotPassword);

router.post('/reset-password', clientController.resetPassword);
module.exports = router;
