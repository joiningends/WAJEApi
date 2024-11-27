const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
  instance_id: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  minIntervalMs: {
    type: Number,
    required: true,
  },
  maxIntervalMs: {
    type: Number,
    required: true,
  },
  campainid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  scheduleTime: {
    type: Date,
    required: false,
  },
 
});

const WhatsAppMessage = mongoose.model('WhatsAppMessage', whatsappMessageSchema);

module.exports = WhatsAppMessage;
