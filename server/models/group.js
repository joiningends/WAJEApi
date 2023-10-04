const mongoose = require('mongoose');




const MessageSchema = new mongoose.Schema({
  clientId:{
    type: mongoose.Schema.Types.ObjectId,
  },
  senderNumber:String,
  sender: String,
  recipient: String,
  content: String,
  projectId: String, // Add projectId field to associate messages with projects
  timestamp: { type: Date, default: Date.now },
});
  
  exports.Message = mongoose.model('Message', MessageSchema);
  