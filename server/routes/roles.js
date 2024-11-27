const express = require('express');
const router = express.Router();
const roleController = require('../controller/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
// Create a new role/user
router.post('/:id',authMiddleware, roleController.createRole);

// Get all roles/users
router.get('/:id',authMiddleware, roleController.getAllRoles);

// Get role/user by ID
router.get('/getbyid/:id',authMiddleware, roleController.getRoleById);
router.get('/get/roles/:userid/:id',authMiddleware, roleController.getAllRolesbyrole);
module.exports = router;
