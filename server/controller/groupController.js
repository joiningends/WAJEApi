const { Message } = require('../models/group');

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

exports.deleteAllMessages = async (req, res) => {
  try {
    // Use await with deleteMany to handle the asynchronous operation
    const result = await Message.deleteMany({});

    console.log('All documents deleted successfully.');
    return res.status(200).json({ message: 'All documents deleted successfully.', result });
  } catch (error) {
    console.error('Error deleting documents:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};