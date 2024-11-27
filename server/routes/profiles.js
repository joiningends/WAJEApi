const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const authMiddleware = require('../middlewares/authMiddleware');
// Create a new profile
router.post('/', authMiddleware, profileController.createProfile);
router.put('/:id', authMiddleware, profileController.updateProfileByInstanceId);
router.get('/client/:clientId', authMiddleware, profileController.getProfilesByClientId);
router.get('/:id', authMiddleware, profileController.getProfileById);
router.delete('/:id', authMiddleware, profileController.deleteProfile);
module.exports = router;
