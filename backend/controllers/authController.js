// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
exports.signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // User.create triggers the pre-save hook in User.js; do not hash manually here
    const user = await User.create({ email, username, password });
    res.status(201).json({ message: 'User created', id: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
 
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    const ok = user && await bcrypt.compare(req.body.password, user.password);
    
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ 
      id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' });
      
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};