const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/orders/:id/cusomerid',  PaymentController.createOrder);
router.post('/verify/:id/cusomerid', PaymentController.verifyPayment);
router.post('/tranfer/orders/:id/cusomerid', PaymentController.createOrderWithTransfer);
router.post('/transfer/verify/:id/cusomerid', PaymentController.verifyPaymentTransfer);


module.exports = router;