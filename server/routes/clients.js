const express = require('express');
const router = express.Router();
const clientController = require('../controller/clientController');


router.post('/', clientController.createClient);


router.get('/', clientController.getAllClients);


router.get('/clients/:id', clientController.getClientById);


router.put('/clients/:id', clientController.updateClientById);


router.delete('/clients/:id', clientController.deleteClientById);
router.get('/:id/total-sent-messages', clientController.getTotalSentMessages);
router.get('/:id/messages', clientController.getMessagesByDateRange);
router.get('/pdf', clientController.generatePDF);
module.exports = router;
