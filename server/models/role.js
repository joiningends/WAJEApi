const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
Name: {
        type: String,
        required: true,
        trim: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Mobile: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        
    },
    password:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken:{
        type:String
      },
          resetPasswordExpires:{
            type:Date
          }
});


const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
