const { Section }  = require('../models/section');

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const userId = req.params.userId; // Get the user ID from the request parameters
    const section = new Section({
      name: req.body.name,
      user: userId, // Assign the user ID to the section
    });

    const savedSection = await section.save();
    res.json(savedSection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getAllSections = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const sections = await Section.find({ user:userId }); 
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Retrieve a section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a section by ID
exports.updateSection = async (req, res) => {
  try {
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updatedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(updatedSection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a section by ID
exports.deleteSection = async (req, res) => {
  try {
    const deletedSection = await Section.findByIdAndRemove(req.params.id);
    if (!deletedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(deletedSection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
