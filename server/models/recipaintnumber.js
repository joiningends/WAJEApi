const mongoose = require('mongoose');
 

const recipientNumberSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  contactNumbers: [Number],
  message: String,
});

exports.RecipientNumber = mongoose.model('RecipientNumber', recipientNumberSchema);