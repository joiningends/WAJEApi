const express = require('express');
const router = express.Router();
const registrationController = require('../controller/registercustomerController');
const authMiddleware = require('../middlewares/authMiddleware');
// Route to register a participant for an event
router.post('/', registrationController.registerForEvent);

// Route to get all participants for a specific event
router.get('/:eventId/participants', authMiddleware, registrationController.getParticipants);
router.delete('/delete/:id', registrationController.deleteRegistration);
router.get('/scanner/:registerId/:eventId/:scannerId', authMiddleware, registrationController.scanQRCode);
router.get('/opt/:registerId/:eventId/:opId', authMiddleware, registrationController.scanQRCodeop);
router.get('/all/byscanner/:eventId', authMiddleware, registrationController.getScannedCustomersbyscanner);
router.get('/byop/:eventId', authMiddleware, registrationController.getScannedCustomersbyop);
router.get('/getbyid/:id', authMiddleware, registrationController.getRegistrationById);
module.exports = router;
