const mongoose = require('mongoose');

const gstVerificationSchema = new mongoose.Schema({
    gstnumber: {
        type: String,
        required: true,
       
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    
    status: {
        type: String,
        
        
    },
    clientid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client', // assuming you have a 'Client' model to reference
        required: true
    }
});

module.exports = mongoose.model('GstVerification', gstVerificationSchema);
