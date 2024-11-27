const mongoose = require('mongoose');




const MessageSchema = new mongoose.Schema({
  clientId:{
    type: mongoose.Schema.Types.ObjectId,
  },
  senderNumber:String,
  sender: String,
  recipient: String,
  content: String,
  projectId: String,
  campainid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  status:{
type:String
  },
  attachment:{
    type:String
  },
  Remark:{
type:String
  },


  
  timestamp: { type: Date, default: Date.now },
});
  
  exports.Message = mongoose.model('Message', MessageSchema);
  