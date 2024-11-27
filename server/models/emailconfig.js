const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
      },
    host: { type: String, default: 'smtp.gmail.com' },
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    user: { type: String, required: true }, // Make user required
    pass: { type: String, required: true }, // Make pass required
});

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
