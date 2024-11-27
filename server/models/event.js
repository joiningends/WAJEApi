const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
 
   
    name:{
        type: String,
    },
    phno:{
        type:Number
    }
   
 
    
});




exports.Event = mongoose.model('Event', eventSchema);
