const mongoose = require('mongoose');

const eibuyerDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
      name:{
        type: String,
      },
    gstin: {
        type: String,
        required: true,
    },
    legal_name: {
        type: String,
        required: true,
    },
    /* trade_name: {
        type: String,
        minlength: 3,
        maxlength: 100,
    }, */
    address1: {
        type: String,
        required: true,
    },
   /*  address2: {
        type: String,
        minlength: 3,
        maxlength: 100,
    }, */
    location: {
        type: String,
        required: true,
    },
     pincode: {
                type: Number,
               
               
            },
    place_of_supply: {
        type: String,
        required: true,
    },
     state_code: {
                type: String,
                
                
            },
          /*   phone_number: {
                type: String,
                minlength: 10,
                maxlength: 12
            },
            email: {
                type: String,
                minlength: 6,
                maxlength: 100
            } */
            
});

module.exports = mongoose.model('EiBuyerDetails', eibuyerDetailsSchema);
