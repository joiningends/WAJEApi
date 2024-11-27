const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampaignSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  contractGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppGroup',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  scheduleTime: {
    type: Date,
    required: false,
  }
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;
