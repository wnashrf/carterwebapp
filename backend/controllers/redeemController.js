// controllers/redeemController.js
exports.redeem = async (req, res) => {
  try {
    const items = await CartItem.find({ user: req.userId }).populate('voucher');
    const total = items.reduce((sum, i) => sum + i.voucher.points * i.quantity, 0);
 
    const user = await User.findById(req.userId);
    if (user.points < total)
      return res.status(400).json({ message: 'Not enough points' });
 
    const now = new Date();
    await CartItemHistory.insertMany(items.map(i => ({
      user: i.user, voucher: i.voucher._id, quantity: i.quantity, timestamp: now })));
    user.points -= total; await user.save();          // deduct points
    await CartItem.deleteMany({ user: req.userId });   // clear the cart
 
    res.status(200).json({ message: 'Redeemed', remaining: user.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
