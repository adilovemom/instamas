const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schema/user');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Post = require('../schema/post');
const BlacklistedToken = require('../middleware/blacklistedToken');


router.post('/users/register', async (req, res) => {
  try {
    
    const { name, email, gender, password, age, city, is_married } = req.body;
    if (!name || !email || !gender || !password || !age || !city || !is_married) {
      return res.status(400).json({ message: 'All fields are required' });
    }

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = new User({
      name,
      email,
      gender,
      password: hashedPassword,
      age,
      city,
      is_married
    });
    await newUser.save();

    
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

   
    res.status(201).json({ token });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/users/login', async (req, res) => {
    try {
      
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
     
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
     
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      res.json({ token });
    } catch (error) {
      console.error('User login error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  
  
  

module.exports = router;
