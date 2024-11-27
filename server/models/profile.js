const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
  name: {
    type: String,
    required: true
  },
  mobile_no: {
    type: String,
    unique:true,
    required: true,
},
  instance_id: {
    type: String,
   
  },
  active:{
    type:Boolean
  },
  nextfreetime:{
    type:Date
  },
nextactive:{
  type:Date
},
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
