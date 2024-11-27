const mongoose = require('mongoose');

const facebookuserSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String,
  profilePicture: String
});

const Facebookuser = mongoose.model('Facebookuser', facebookuserSchema);

module.exports = Facebookuser;
