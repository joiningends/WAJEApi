const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventmController');
const authMiddleware = require('../middlewares/authMiddleware');
// Create Event
router.post('/:id', authMiddleware, eventController.createEvent);

// Get All Events
router.get('/all/:id',authMiddleware, eventController.getEvents);
router.get('/all/sales/marketing/:id',authMiddleware, eventController.getEventsbysalesandmarketing);
// Get Event by ID
router.get('/:id', eventController.getEventById);

// Update Event
router.put('/events/:id',authMiddleware, eventController.updateEvent);

// Delete Event
router.delete('/events', eventController.deleteEvent);
router.get('/timeslotevent/:id', eventController.getEvent);
router.get('/sales/:id', authMiddleware, eventController.getEventsbysales);
router.get('/patner/getall/:id', authMiddleware, eventController.getEventsbypatner);
//router.get('/sales/:id', eventController.getEventsbysales);
router.get('/scanner/:scannerId', authMiddleware, eventController.getAllEventsByScanner);
router.get('/optomatics/:optimisticId', authMiddleware, eventController.getAllEventsByOptimistic);
router.put('/email/:id', authMiddleware, eventController.createOrUpdateEventEmail);
module.exports = router;
