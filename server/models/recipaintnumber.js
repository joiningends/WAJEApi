const mongoose = require('mongoose');
 

const recipientNumberSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  contactNumbers: [
    {
  number: Number,
  Param1:String,
  Param2:String,
  Param3:String,
  Param4:String,
  Param5:String,
    }
  ]
});

exports.RecipientNumber = mongoose.model('RecipientNumber', recipientNumberSchema);