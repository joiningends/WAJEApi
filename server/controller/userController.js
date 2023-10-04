
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
            userId: 'admin-id', 
            role: 'admin',
           
          },
          secret,
          { expiresIn: '30min' }
        );
  
        return res.status(200).send({ user: email, role: 'admin', token: token,  });
      }
  
      
      
  
        
      
      res.status(400).send('Invalid email or password!');
    } catch (error) {
      res.status(500).json({ error: 'Failed to log in' });
    }
  };
  