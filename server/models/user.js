const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
 
   
    name:{
        type: String,
    },
   
    email: {
        type: String,
        required: true,
        unique: true
      },
    
    password: {
        type: String,
        
    },
    instanceid:{
        type: String,
    }
    
});




exports.User = mongoose.model('User', userSchema);
