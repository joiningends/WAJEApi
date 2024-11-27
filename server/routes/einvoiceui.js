const express = require('express');
const router = express.Router();
const eInvoiceuiController = require('../controller/einvoiceuiController');
const authMiddleware = require('../middlewares/authMiddleware');
// Route to create an E-Invoice
router.post('/create/:id', authMiddleware, eInvoiceuiController.generateEInvoice);


module.exports = router;
