const mongoose = require('mongoose');




const clientSchema = new mongoose.Schema({
 name: String,
 sender:{
   type:String 
 }
  
});
  
  exports.Client= mongoose.model('Client', clientSchema);
  