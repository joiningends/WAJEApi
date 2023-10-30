
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

  exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user is the admin
    if (email === 'admin@example.com' && password === 'adminpassword') {
      const secret = process.env.secret;
      const token = jwt.sign(
        {
          userId: 'admin-id', // You can use an actual admin ID from your database here.
          role: 'admin',
         
        },
        secret,
        { expiresIn: '30d' }
      );

      return res.status(200).send({ user: email, role: 'admin', token: token });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password!');
    }

   
    
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      let role = 'user'; // Default role is user
     

     

      const secret = process.env.secret;
      const token = jwt.sign(
        {
          userId: user.id,
          role: role,
         
         
        },
        secret,
        { expiresIn: '30d' }
      );

      return res.status(200).send({ userId: user.id, user: user.email, role: role, token: token });
    }

   
    res.status(400).send('Invalid email or password!');
  } catch (error) {
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