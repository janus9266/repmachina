require('dotenv').config();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/users')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  console.log(req)
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({"email": payload.email})

    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture
      })

      await newUser.save();
    }

    const customToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        emai: user.email,
        avatar: user.avatar
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h"
      }
    );

    res.json({ access_token: customToken });
  } catch (error) {
    console.error('Error verifying Google token', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};