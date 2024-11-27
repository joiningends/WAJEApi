const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WhatsAppGroupSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
  name: {
    type: String,
    required: true
  },
  groupid:{
    type: String,
    required: true
  },
  successcount: {
    type: Number,
    default: 0
  },
  failurecount: {
    type: Number,
    default: 0
  },
active:{
    type:Boolean
}
});

const WhatsAppGroup = mongoose.model('WhatsAppGroup', WhatsAppGroupSchema);

module.exports = WhatsAppGroup;
