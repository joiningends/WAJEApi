const mongoose = require('mongoose');

const eisellerdetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
      name:{
        type: String,
      },
        gstin: {
            type: String,
           
        },
        legal_name: {
            type: String,
           
        },
        /* trade_name: {
            type: String,
            minlength: 3,
            maxlength: 100
        }, */
        address1: {
            type: String,
            
        },
        /* address2: {
            type: String,
            minlength: 3,
            maxlength: 100
        }, */
        location: {
            type: String,
           
        },
        pincode: {
            type: Number,
            
        },
        state_code: {
            type: String,
            
        },
        /* phone_number: {
            type: String,
        },
        email: {
            type: String,
        } */
    }
);

module.exports = mongoose.model('EISellerDetails', eisellerdetailsSchema);
