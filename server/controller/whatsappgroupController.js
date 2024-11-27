const WhatsAppGroup = require('../models/whatsappgroup'); // Adjust the path as necessary
const { Client } = require('../models/clints');
exports.createWhatsAppGroup = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Client.findById(userId);

    if (!user) {
      return res.status(404).send('Client not found.');
    }
    const {  name, groupid } = req.body;

    if (!user || !name || !groupid) {
      return res.status(400).json({ success: false, message: 'User, name, and groupid are required.' });
    }

    const newGroup = new WhatsAppGroup({
      user,
      name,
      groupid,
      active:true
    });

    const savedGroup = await newGroup.save();
    res.status(201).json({ success: true, data: savedGroup });
  } catch (error) {
    console.error('Error creating WhatsApp group:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};




// Get all WhatsApp groups by user ID
exports.getWhatsAppGroupsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const groups = await WhatsAppGroup.find({ user: userId });

    if (!groups || groups.length === 0) {
      return res.status(404).json({ success: false, message: 'No groups found for this user.' });
    }

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    console.error('Error retrieving WhatsApp groups:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update a WhatsApp group by ID
exports.updateWhatsAppGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const updates = req.body;

    const updatedGroup = await WhatsAppGroup.findByIdAndUpdate(groupId, updates, { new: true });

    if (!updatedGroup) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    res.status(200).json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error('Error updating WhatsApp group:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


exports.updateSectionactive = async (req, res) => {
    try {
      // Check if the 'active' field is present in the request body
      if (req.body.active === undefined) {
        return res.status(400).json({ error: "'active' field is required" });
      }
  
      const updatedSection = await WhatsAppGroup.findByIdAndUpdate(
        req.params.id,
        { active: req.body.active },
        { new: true }
      );
  
      if (!updatedSection) {
        return res.status(404).json({ error: 'whatsappgroup not found' });
      }
  
      res.json(updatedSection);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  exports.getAllActiveSections = async (req, res) => {
    try {
      const userId = req.params.userId; 
      
      const activeSections = await WhatsAppGroup.find({ user: userId, active: true });
  
      res.json(activeSections);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  
exports.getWhatsAppGroupById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the id from the request parameters
    const group = await WhatsAppGroup.findById(id).populate('user'); // Populate the 'user' field if necessary

    if (!group) {
      return res.status(404).json({ success: false, message: 'WhatsApp Group not found' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error fetching WhatsApp Group by ID:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
