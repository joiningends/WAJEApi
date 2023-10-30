const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/login', userController.loginUser);
router.post('/', userController.registerNormalUser);
router.put('/:userId/instanceid', userController.updateUserInstanceID);
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);
module.exports = router;