const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    recipientNumbers: [Number],
  message: String,
});

const WhatsAppMessage = mongoose.model('WhatsAppMessage', whatsappMessageSchema);

module.exports = WhatsAppMessage;
