const mongoose = require('mongoose');

const eyePrescriptionSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Registration',
      required: true 
  },
  eventId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'Event', 
      required: true
    },
    pdfPath: { type: String, required: true },
  prescription: {
    leftEye: {
      cylindrical: { type: Number, default: null }, // Values can be decimal
      spherical: { type: Number, default: null },
      axis: { type: Number, default: null },
      additional: { type: String, default: null }, // Any extra info
    },
    rightEye: {
      cylindrical: { type: Number, default: null },
      spherical: { type: Number, default: null },
      axis: { type: Number, default: null },
      additional: { type: String, default: null },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('EyePrescription', eyePrescriptionSchema);
