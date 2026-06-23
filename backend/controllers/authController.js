// controllers/authController.js
const RedeemedVoucher = require('../models/RedeemedVoucher');
const CartItemHistory = require('../models/CartItemHistory');
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
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalRedeemedCount = await RedeemedVoucher.countDocuments({ user: req.userId });
    
    // Fetch user transaction history stream populated with voucher details
    const activityLogs = await CartItemHistory.find({ user: req.userId })
      .populate('voucher')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      user,
      stats: {
        vouchersRedeemed: totalRedeemedCount,
        memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      },
      activity: activityLogs.map(log => ({
        id: log._id,
        icon: 'pi-check-circle',
        color: '#22c55e',
        label: `Redeemed ${log.voucher?.title || 'Voucher'}`,
        pts: `-${((log.voucher?.points || 0) * (log.quantity || 1)).toLocaleString()} pts`,
        date: new Date(log.timestamp).toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, username } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update variables safely
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.username = username || user.username;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};