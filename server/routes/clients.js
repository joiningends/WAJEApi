const express = require('express');
const router = express.Router();
const clientController = require('../controller/clientController');

// Create a client (POST)
router.post('/', clientController.createClient);

// Get all clients (GET)
router.get('/', clientController.getAllClients);

// Get a single client by ID (GET)
router.get('/clients/:id', clientController.getClientById);

// Update a client by ID (PUT)
router.put('/clients/:id', clientController.updateClientById);

// Delete a client by ID (DELETE)
router.delete('/clients/:id', clientController.deleteClientById);
router.get('/:id/total-sent-messages', clientController.getTotalSentMessages);
router.get('/:id/messages', clientController.getMessagesByDateRange);
router.get('/pdf', clientController.generatePDF);
module.exports = router;
