const User = require('../model/authModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); // Add Google Auth Library
const axios = require("axios");
const BlacklistedToken = require('../model/blacklistToken.js');


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // From .env
const client = new OAuth2Client(CLIENT_ID);


exports.googleLogin = async (req, res) => {
  try {
      const { token } = req.body;
      if (!token) {
          return res.status(400).json({ message: 'Token is required' });
      }

      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, sub: googleId } = payload;

      // Move the username assignment here
      const username = name || email.split('@')[0];

      let auth = await User.findOne({ email });
      if (!auth) {
          auth = new User({ email, name, googleId, username });
          await auth.save();

          const userProfile = new UserProfile({ authId: auth._id });
          await userProfile.save();
      } else if (!auth.googleId) {
          auth.googleId = googleId;
          await auth.save();
      }

      const tokenJwt = jwt.sign({ id: auth._id, email: auth.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token: tokenJwt });
  } catch (err) {
      //console.error('Google Login Error:', err.message, err.stack);
      res.status(500).json({ message: 'Google authentication failed', error: err.message });
  }
};

exports.microsoftLogin = async (req, res) => {
  try {
      const { token } = req.body;
      if (!token) {
          return res.status(400).json({ message: 'Token is required' });
      }

      const response = await axios.get(`https://graph.microsoft.com/v1.0/me`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      const { email, displayName: name, id: microsoftId } = response.data;

      // Move the username assignment here
      const username = name || email.split('@')[0];

      let auth = await User.findOne({ email });
      if (!auth) {
          auth = new User({ email, name, microsoftId, username });
          await auth.save();

          const userProfile = new UserProfile({ authId: auth._id });
          await userProfile.save();
      } else if (!auth.microsoftId) {
          auth.microsoftId = microsoftId;
          await auth.save();
      }

      const tokenJwt = jwt.sign({ id: auth._id, email: auth.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token: tokenJwt });
  } catch (err) {
      //console.error('Microsoft Login Error:', err.message, err.stack);
      res.status(500).json({ message: 'Microsoft authentication failed', error: err.message });
  }
};

exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const blacklist = new BlacklistedToken({ token });
        await blacklist.save();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error.message, error.stack);
        res.status(500).json({ message: 'Logout failed', error: error.message });
        
    }
}

module.exports = {
    googleLogin: exports.googleLogin,
    microsoftLogin: exports.microsoftLogin,
    logout: exports.logout
}