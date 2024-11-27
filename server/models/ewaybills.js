const mongoose = require('mongoose');


const ewayBillSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client'
      },
      status: {
        type: String,
        
        
    },
    timestamp: { type: Date, default: Date.now },
    userGstin: { 
        type: String,
         
         },
         supply_type: { 
        type: String,
         
         },
         sub_supply_type: {
         type: String,
          
         },
         sub_supply_description:{
            type: String, 
         },
         document_type: {
         type: String, 
         
         },
         document_number: {
         type: String, 
         
         },
         document_date: {
         type: String,
         
         },
         gstin_of_consignor: { 
        type: String, 
        
     },
   /*  legalNameOfConsignor: 
    {
        type:String
    },  
    address1OfConsignor:  {
        type:String
    },
    address2OfConsignor:  {
        type:String
    }, 
    placeOfConsignor:  {
        type:String
    }, */
    pincode_of_consignor: { 
        type: Number, 
        
     },
     state_of_consignor: { 
        type: String, 
       
    },
    gstin_of_consignee: { 
        type: String, 
        
     },
     /*  legalNameOfConsignee: {
        type:String
    },
     address1OfConsignee: {
        type:String
    }, 
     address2OfConsignee: {
        type:String
    }, */
    place_of_consignee: { 
        type: String, 
        
     },
     pincode_of_consignee: {
         type: Number, 
         
        },
        state_of_supply: { 
        type: String,
         
         },
         total_invoice_value:{
            type: Number, 
         },
         taxable_amount: { 
        type: Number, 
        
    },
     /* cgstAmount: {
        type: Number
     }, 
     sgstAmount: {
        type: Number
     },
     igstAmount: {
        type: Number
     }, 
     cessAmount: {
        type: Number
     }, */

     transportation_mode: { 
        type: String,
         
        },
   /*  vehicleType:  {
        type: String
     },  */
    transportationDistance: { 
        type: Number, 
        
    },
    transporter_id: {
         type: String, 
        
        },
    /* transporterName:  {
        type: String
     },   
    transporterDocumentNumber: {
        type: String
     },  
    transporterDocumentDate:  {
        type: String
     }, */
     vehicle_number: { 
        type: String, 
        
    },
    stateCode: { 
        type: String, 
         
    },

    itemList:[{
        product_name: { 
        type: String, 
        
    },
   /*  productDescription:{
        type: String
    },  */
    hsn_code: {
         type: Number,
          
         },
    quantity: {
         type: Number, 
          
        },
        unit_of_product: { 
        type: String,
         
        },
        taxable_amount:{
            type: Number, 
           
        },  
        cgst_rate: { 
        type: Number, 
        
    },
    sgst_rate: { 
        type: Number, 
        
    },
    igst_rate: {
        type: Number,
          
        },
    /* cessRate:  {
        type: Number
    },  */
}],
ewayBillNo: {
    type: Number,
  },
  ewayBillDate: {
    type: String,
  },
  validUpto: {
    type: String,
  },
  alert: {
    type: String,
  },
  error: {
    type: Boolean,
  },
  url: {
    type: String,
  },
  requestId:{
    type: String,
  }

    })

    exports.EwayBill = mongoose.model('EwayBill', ewayBillSchema);
