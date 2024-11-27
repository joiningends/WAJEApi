const EmailConfig = require('../models/emailconfig');

// Create a new email configuration
exports.createEmailConfig = async (req, res) => {
    try {
        const { host, port, secure, user, pass } = req.body;
        const client = req.params.clientId;  // Get clientId from req.params

        

        const newEmailConfig = new EmailConfig({ client, host, port, secure, user, pass });
        const savedConfig = await newEmailConfig.save();
        res.status(201).json(savedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error creating email configuration', error });
    }
};


// Get all email configurations
exports.getEmailConfigByClientId = async (req, res) => {
    try {
        const configs = await EmailConfig.find({ client: req.params.clientId }); // Fetches all configs by clientId
        if (!configs || configs.length === 0) {
            return res.status(404).json({ message: 'No email configurations found for this client' });
        }
        res.status(200).json(configs); // Returns an array of configurations
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving email configurations', error });
    }
};

// Get a single email configuration by ID
exports.getEmailConfigById = async (req, res) => {
    try {
        const config = await EmailConfig.findById(req.params.id);
        if (!config) return res.status(404).json({ message: 'Email configuration not found' });
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving email configuration', error });
    }
};

// Update an email configuration by ID
exports.updateEmailConfig = async (req, res) => {
    try {
        const updatedConfig = await EmailConfig.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedConfig) return res.status(404).json({ message: 'Email configuration not found' });
        res.status(200).json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error updating email configuration', error });
    }
};

// Delete an email configuration by ID
exports.deleteEmailConfig = async (req, res) => {
    try {
        const deletedConfig = await EmailConfig.findByIdAndDelete(req.params.id);
        if (!deletedConfig) return res.status(404).json({ message: 'Email configuration not found' });
        res.status(200).json({ message: 'Email configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting email configuration', error });
    }
};


const nodemailer = require('nodemailer');


exports.sendEmail = async (req, res) => {
    try {
        // Configure the email transport for Outlook
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com', // Outlook SMTP server
            port: 587,                  // SMTP port for TLS
            secure: false,              // Use TLS
            auth: {
                user: 'support@starplus.com.ng',   // replace with your Outlook email
                pass: 'ffknkcmkmmxjzthk'       // replace with your email password
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        // Set up email options
        const mailOptions = {
            from: 'support@starplus.com.ng', // sender address
            to: req.body.to,                // receiver's email from request body
            subject: "testing",      // subject from request body
            text: "hii"             // message from request body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        
        // Respond to the client
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};
