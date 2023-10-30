const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    name: String
});

 exports.Section = mongoose.model('Section', sectionSchema);
