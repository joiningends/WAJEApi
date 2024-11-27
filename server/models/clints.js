const mongoose = require('mongoose');
const clientSchema = new mongoose.Schema({

  name: { type: String, required: true },
  sender: { type: String },
  email: { type: String },
  mobile: { type: String },
  companyName: { type: String },
  gstNo: { type: String },
  address: { type: String },
  password: { type: String,  },
  wa: { type: Boolean, default: false },
  ei: { type: Boolean, default: false },
  Wag:{
     type: Boolean, 
     default: false
  },
  whatsappmodel: {
    cm: { type: Number, default: 0 },
    cmf: { type: Number, default: 0 },
    mt: { type: Number, default: 0 },
  },

  whatsappmodelgroup: {
    cm: { type: Number, default: 0 },
    cmf: { type: Number, default: 0 },
    mt: { type: Number, default: 0 },
  },
  einvoicemodel: {
    gstverification: { type: Number, default: 0 },
    einvoice: { type: Number, default: 0 },
    ewaybill: { type: Number, default: 0 },
  },
  event:{
type:Boolean
  },
  wfb:{
    type:Boolean
  },
  Totalcredit:{
    type: Number,
 },
 totalcredit: [

   {
     date: { type: Date,
        default: Date.now },
     value: { type: Number, default: 0 },
     by: { type: String },
   },
 ],
 creditused:{
  type: Number, default: 0
 },

 Totalcreditforeinvoice:{
  type: Number,
  default: 0
},
totalcreditforeinvoice: [

 {
   date: { type: Date,
      default: Date.now },
   value: { type: Number, default: 0 },
   by: { type: String },
 },
],
creditusedforeinvoice:{
type: Number, default: 0
},
Totalcrediteinvoice:{
  type: Number,
  default: 0
},
storagelimit:{
  type: Number 
},
storageused:{
  type: Number,
  default: 0
},
resetPasswordToken:{
  type:String
},
    resetPasswordExpires:{
      type:Date
    },
    wapc:{
      type:Number
    },
    facebookId: { type: String,  }, // For Facebook users
    profilePicture: { type: String },

});



  
  exports.Client= mongoose.model('Client', clientSchema);
  