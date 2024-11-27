const express = require('express');
const router = express.Router();
const eInvoiceController = require('../controller/einvoiceController');

// Route to create an E-Invoice
router.post('/create/:id', eInvoiceController.createEInvoice);

// Route to cancel an E-Invoice
router.post('/cancel', eInvoiceController.cancelEinvoice);
router.get('/report/:clientid', eInvoiceController.generateInvoiceReport);
router.get('/report/date/:clientid', eInvoiceController.generateInvoiceReportbydate);
module.exports = router;
