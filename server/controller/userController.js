
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('../models/clints');
const Role = require('../models/role');
  


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Define role mapping
  const roleMapping = {
    1: "Sales Marketing",
    2: "Scanner",
    3: "Optometrist",
    4: "Partner",
  };

  try {
    // Admin login
    if (email === 'admin@example.com' && password === 'adminpassword') {
      const secret = process.env.secret;
      const expiresIn = '30d';  // Admin token expires in 30 days
      const token = jwt.sign(
        {
          userId: 'admin-id', // Use actual admin ID
          role: 'admin',
        },
        secret,
        { expiresIn }
      );

      // Calculate the expiry date and format it to IST
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const expiryInIST = expiryDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return res.status(200).send({ user: email, role: 'admin', token, expiresAt: expiryInIST });
    }

    // Try to find user in Client collection
    const user = await Client.findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      const role = 'user'; // Default role
      const secret = process.env.secret;
      const expiresIn = '24h';  // User token expires in 24 hours
      const token = jwt.sign(
        {
          userId: user.id,
          role,
        },
        secret,
        { expiresIn }
      );

      // Calculate the expiry date and format it to IST
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const expiryInIST = expiryDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return res.status(200).send({ userId: user.id, user: user.email, role, token, expiresAt: expiryInIST });
    }

    // Try to find user in Role collection
    const userrole = await Role.findOne({ Email: email });
    
    if (!userrole || !bcrypt.compareSync(password, userrole.password)) {
      return res.status(400).send('Invalid email or password!');
    }

    // Map numeric role to string role
    const role = roleMapping[userrole.role] || 'Unknown Role';
    const secret = process.env.secret;
    const expiresIn = '24h';  // Role token expires in 24 hours
    const token = jwt.sign(
      {
        userId: userrole.id,
        role,
      },
      secret,
      { expiresIn }
    );

    // Calculate the expiry date and format it to IST
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const expiryInIST = expiryDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return res.status(200).send({ userId: userrole.id, user: userrole.Email, role, token, expiresAt: expiryInIST });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};





  

exports.updateUserInstanceID = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newInstanceId = req.body.instanceid;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the instanceid field
    user.instanceid = newInstanceId;

    // Save the updated user
    await user.save();

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




exports.registerNormalUser = async (req, res) => {
  
    try {
      const { name, email, password } = req.body;
  
      const passwordHash = await bcrypt.hash(password, 10);
  
     
  
      const user = new User({
        name,
        email,
        passwordHash,
       
      });
  
      const savedUser = await user.save();
  
      if (!savedUser) {
        return res.status(400).send('The user could not be created!');
      }
  
       
      res.send(savedUser);
    } catch (error) {
      console.error('Failed to create user:', error);
      res
        .status(500)
        .json({ success: false, error: 'An error occurred while creating the user' });
    }
  };
 

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};