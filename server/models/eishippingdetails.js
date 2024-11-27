const mongoose = require('mongoose');

const eishipDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
      name:{
        type: String,
      },
    legal_name: {
        type: String,
        required: true,
    },
    address1: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    state_code: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('EishipDetails', eishipDetailsSchema);
