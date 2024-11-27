const Role = require('../models/role');
const { sendPasswordByEmail } = require("../controller/emailController");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
exports.createRole = async (req, res) => {
  try {
    const { Name, Email, Mobile, role } = req.body;
    const clientId = req.params.id;

    // Generate a random reset token
    const resetToken = jwt.sign({ email: Email }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Create the new user (role in this case)
    const newRole = new Role({
      clientId,
      Name,
      Email,
      Mobile,
      role,
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 3600000, // 1 hour in milliseconds
    });

    // Save the new user/role to the database
    await newRole.save();

    // Respond with success message
    res.status(201).json({
      message: 'User created successfully. A password reset link will be sent via email shortly.',
      newRole,
    });

    // Prepare the HTML email content with the reset link
    const emailHtml = `
      <p>Your client account has been successfully created.</p>
      <p>To set your password, please click the link below:</p>
      <a href="${process.env.CLIENT_URL}/setPassword/client/reset/${resetToken}">Set Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send email with reset link (asynchronous task)
    sendPasswordByEmail(Name, Email, emailHtml)
      .then(() => {
        console.log(`Email sent to ${Email}`);
      })
      .catch((err) => {
        console.error(`Error sending email to ${Email}:`, err);
      });

  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email error
      return res.status(400).json({ message: 'Email already exists' });
    } else {
      // Log the error for debugging
      console.error("Error creating user:", error);

      // Send a more detailed error response
      res.status(500).json({
        message: 'Error creating user',
        error: error.message || error,
        stack: error.stack
      });
    }
  }
};

  
 
  



// Get all roles
exports.getAllRoles = async (req, res) => {
    const client = req.params.id;
    try {
        const roles = await Role.find({clientId:client});
        res.status(200).json({ roles });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json({ role });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching role', error });
    }
};

exports.getAllRolesbyrole = async (req, res) => {
    const role = req.params.id;  
    const client = req.params.userid;
    
    try {
        // Log the values to ensure you are receiving them
        console.log(`Role: ${role}, Client ID: ${client}`);
        
        // Find roles matching the provided role and client ID
        const roles = await Role.find({ role: role, clientId: client });
        
        // If roles are found, send them in response
        if (roles.length > 0) {
            res.status(200).json({ roles });
        } else {
            res.status(404).json({ message: 'No roles found for the given criteria' });
        }
    } catch (error) {
        // Catch any errors and respond with a 500 status code
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};