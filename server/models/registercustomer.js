const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participantFields: [{
    fieldName: { type: String, required: true },
    fieldValue: { type: String, required: true }
  }],
  paymentStatus:{
    type: String,
  },
  qrCode:{
    type: String,
  },
  qrcodescanned:{
    type: Boolean,
    default:false
  },
  qrcodescannedbyop:{
    type: Boolean,
    default:false
  },
  qrcodeScannedTime: { // New field for storing the scan time
    type: Date,
  },
  qrcodeScannedopTime: { // New field for storing the scan time
    type: Date,
  },
  reminderSent: { type: Boolean, default: false },
  registrationTime: { type: Date, default: Date.now }
}, { timestamps: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
