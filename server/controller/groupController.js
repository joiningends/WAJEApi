const { Message } = require('../models/group');

// Controller to track a message
 exports.trackMessage = async (req, res) => {
  try {
    const { clientId,  sender, recipient, content } = req.body;
    const message = new Message({ clientId, sender, recipient, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error tracking message:', error);
    res.status(500).json({ error: 'Failed to track message' });
  }
}



