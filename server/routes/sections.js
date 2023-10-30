const express = require('express');
const router = express.Router();
const sectionController = require('../controller/sectionsController');


router.post('/:userId', sectionController.createSection);

// Retrieve all sections
router.get('/users/:userId', sectionController.getAllSections);


router.get('/:id', sectionController.getSectionById);


router.put('/:id', sectionController.updateSection);


router.delete('/:id', sectionController.deleteSection);

module.exports = router;
