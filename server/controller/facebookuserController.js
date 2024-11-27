const fetch = require('node-fetch'); // Ensure fetch is imported
const { Client } = require('../models/clints');
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.facebooklogin = async (req, res) => {
  const { accessToken } = req.body;

  // Verify the token with Facebook
  try {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
      const userData = await response.json();

      // Check if the response from Facebook is valid
      if (!userData || userData.error) {
          return res.status(401).json({ error: 'Invalid access token or unable to fetch user data from Facebook.' });
      }

      // Extract relevant fields from the response
      const { id, name, email, picture } = userData;

      // Check if the user exists in your database
      let user = await Client.findOne({ email });

      if (!user) {
          // Create a new user if they do not exist
          user = new Client({
              name: name,
              email: email,
              facebookId: id,
              wfb:true, // Store Facebook ID for future reference
              profilePicture: picture.data.url // Store profile picture URL
              // You can add other fields as needed (e.g., role, createdAt, etc.)
          });

          await user.save();
      }

      // Generate a JWT token with a 30-minute expiration
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(
          {
              userId: user.id,
              role: 'user', // Default role for new users
          },
          secret,
          { expiresIn: '30min' }
      );

      // Calculate expiration time in Indian Standard Time (IST)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Return response with user details, token, and expiration time
      return res.status(200).json({
          userId: user.id,
          user: user.email,
          role: 'user',
          token,
          expiresAt
      });

  } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(500).json({ error: 'Error verifying token' });
  }
};




exports.sendWhatsAppMessageusingcloudap = async (req, res) => {
  
  const { toPhoneNumber } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!toPhoneNumber) {
    return res.status(400).json({ error: 'Recipient phone number is required.' });
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required.' });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhoneNumber,
        type: 'template',
        template: {
          name: 'hello_world', // Example template for testing
          language: { code: 'en_US' }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ message: 'Message sent successfully!', data: response.data });
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      error: 'Failed to send message.',
      details: error.response ? error.response.data : error.message 
    });
  }
};

