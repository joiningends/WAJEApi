const { Client } = require('../models/clints');
const { Message } = require('../models/group');
const puppeteer = require('puppeteer');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const bcrypt = require("bcryptjs");
const Role = require('../models/role');
exports.createClient = async (req, res) => {
  try {
    const clientData = req.body;

    // Create a new client instance
    const newClient = new Client(clientData);

    // Save the new client to the database
    const savedClient = await newClient.save();

    // Generate JWT token for password reset
    const resetToken = jwt.sign({ clientId: savedClient._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Update client with reset token and expiry
    savedClient.resetPasswordToken = resetToken;
    savedClient.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
    await savedClient.save();

    // Send email to the client with password reset link
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
          user: 'joiningends93@gmail.com',
          pass: 'phxq dgpu etkz afuu',
      },
  });

  const mailOptions = {
      from: 'joiningends93@gmail.com',
      to: savedClient.email,
      subject: 'Client Account Created',
      html: `
        <p>Your client account has been successfully created.</p>
        <p>Your login details are:</p>
        <p>Email: ${savedClient.email}</p>
        <a href="${process.env.CLIENT_URL}/setPassword/client/reset/${resetToken}">Set Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Respond with success message and saved client data
    res.status(201).json({ message: 'Client created successfully', client: savedClient });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error creating client', error: error.message });
  }
};


exports.getAllClients = async (req, res) => {
    try {
      const clients = await Client.find();
      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  };
  exports.getClientById = async (req, res) => {
    try {
      const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({ error: 'Failed to fetch client' });
    }
  };
  
  exports.updateClientById = async (req, res) => {
    const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
    const updateData = req.body;
  
    try {
      const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, { new: true, runValidators: true });
  
      if (!updatedClient) {
        return res.status(404).send('Client not found');
      }
  
      res.send(updatedClient);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  
    
  exports.deleteClientById = async (req, res) => {
    try {
      const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
      const client = await Client.findByIdAndRemove(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Failed to delete client' });
    }
  };
  
  
  exports.getTotalSentMessages = async (req, res) => {
    
  try {
    const clientId = req.params.id; 
    const totalMessages = await Message.countDocuments({ clientId });

    // Fetch message details for the client (replace this with your actual logic)
    const messages = await Message.find({ clientId });

    res.json({ totalMessages, messages });
  } catch (error) {
    console.error('Error retrieving total sent messages count:', error);
    res.status(500).json({ error: 'Failed to retrieve total sent messages count' });
  }
  }
  

  
  exports.getMessagesByDateRange = async (req, res) => {
    try {
      const clientId = req.params.id; 
      const { from, to } = req.query; 
  
      
      const fromDate = new Date(from);
      const toDate = new Date(to);
  
      toDate.setHours(23, 59, 59, 999);

      const messages = await Message.find({
        clientId,
        timestamp: {
          $gte: fromDate, 
          $lte: toDate,  
        },
      });
      console.log(messages, from, to);
      res.json({from, to, messages }); 
      
    } catch (error) {
      console.error('Error retrieving messages by date range:', error);
      res.status(500).json({ error: 'Failed to retrieve messages by date range' });
    }
  };
  

  exports.generatePDF = async (req, res) => {
    try {
      
      const browser = await puppeteer.launch({ headless: true }); // Use 'true' for headless mode
      const page = await browser.newPage();
  
      // Replace 'https://www.example.com' with the actual URL from which you want to generate the PDF
      await page.goto(`http://localhost:3000/pdf`, {
        waitUntil: 'networkidle2',
      });
  
      await page.setViewport({ width: 1680, height: 1050 });
  
      const todayDate = new Date();
      const pdfFilename = `${Client.name}-whatsapp-${todayDate.getTime()}.pdf`; // Set the PDF filename with the name included
  
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  
      await browser.close();
  
      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
  
      // Send the PDF buffer as the response
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      res.status(500).json({ error: 'Error generating PDF report' });
    }
  };
  


  

exports.updateTotalCredit = async (req, res) => {
  const { clientId, date, value, by } = req.body;

  if (!clientId || !date || !value || !by) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Add the new credit entry to the totalcredit array
    client.totalcredit.push({ date, value, by });

    // Calculate the new Totalcredit value
    const newTotalCredit = client.totalcredit.reduce((acc, entry) => acc + entry.value, 0);

    const newTotalCredits = newTotalCredit - client.creditused
    client.Totalcredit = newTotalCredits;

    // Save the updated client document
    await client.save();

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error('Error updating total credit:', error);
    res.status(500).json({ success: false, error: 'Failed to update total credit' });
  }
};

exports.updateTotalCrediteinvoice = async (req, res) => {
  const { clientId, date, value, by } = req.body;

  if (!clientId || !date || !value || !by) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Add the new credit entry to the totalcredit array
    client.totalcreditforeinvoice.push({ date, value, by });

    // Calculate the new Totalcredit value
    const newTotalCredit = client.totalcreditforeinvoice.reduce((acc, entry) => acc + entry.value, 0);

    const newTotalCredits = newTotalCredit - client.creditusedforeinvoice
    client.Totalcreditforeinvoice = newTotalCredits;

    // Save the updated client document
    await client.save();

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error('Error updating total credit:', error);
    res.status(500).json({ success: false, error: 'Failed to update total credit' });
  }
};





exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the client exists with the provided email
    const client = await Client.findOne({ email });

    if (client) {
      await sendResetPasswordEmail(client, 'client', res);
    } else {
      // Client not found with the provided email
      return res.status(404).json({ message: "Client not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to initiate password reset" });
  }
};

const sendResetPasswordEmail = async (entity, entityType, res) => {
  const resetToken = jwt.sign({ id: entity._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });

  entity.resetPasswordToken = resetToken;
  entity.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
  await entity.save();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'inspiron434580@gmail.com',
        pass: 'rogiprjtijqxyedm',
    },
});

const mailOptions = {
    from: 'inspiron434580@gmail.com',
    
    to: entity.email,
    subject: "Password Reset Request",
    html: `
      <p>Hi ${entity.name},</p>
      <p>You are receiving this email because you (or someone else) have requested a password reset for your account.</p>
      <p>Please click the following link to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/setPassword/${entityType}/reset/${resetToken}">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Thanks,<br>Team Inspiron</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send password reset email" });
    } else {
      console.log("Password reset email sent:", info.response);
      res.status(200).json({ message: "Password reset email sent successfully" });
    }
  });
};




exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Attempt to find user in Client model
    let user = await Client.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    let userType = 'Client';

    // If not found in Client, check in Role model
    if (!user) {
      user = await Role.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
      userType = 'Role';
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update user's password and clear reset token fields
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Nodemailer setup for confirmation email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'joiningends93@gmail.com',
        pass: 'phxq dgpu etkz afuu', // Use environment variables in production
      },
    });

    // Determine email field based on userType
    const recipientEmail = userType === 'Client' ? user.email : user.Email;

    const mailOptions = {
      from: 'joiningends93@gmail.com',
      to: recipientEmail,
      subject: "Password Reset Confirmation",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully reset. If you did not initiate this request, please contact support.</p>
        <p>Thanks,<br>Team Inspiron</p>`,
    };

    // Send confirmation email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Password reset confirmation email sent:", info.response);
      }
    });

    res.status(200).json({ message: `${userType} password reset successfully` });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
