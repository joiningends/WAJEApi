const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
    name: String,
    successCount: {
      type: Number,
      default: 0,
  },
  failureCount: {
      type: Number,
      default: 0,
  },
  active:{
    type:Boolean
  },
  count:{
    type: Number,
      default: 0,
  }
});

 exports.Section = mongoose.model('Section', sectionSchema);
