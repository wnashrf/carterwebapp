// controllers/redeemController.js
const CartItem = require('../models/CartItem');
const User = require('../models/User');
const CartItemHistory = require('../models/CartItemHistory');
const {generateRedemptionPDF} = require('../utils/pdfGenerator')

exports.redeem = async (req, res) => {
  try {
    const items = await CartItem.find({ user: req.userId }).populate({
      path: 'voucher', populate: {path: 'category_id'}});
    
    if (items.length === 0){
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const total = items.reduce((sum, i) => sum + i.voucher.points * i.quantity, 0);
 
    const user = await User.findById(req.userId);
    if (!user){
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.points < total){
      return res.status(400).json({ message: 'Not enough points' });
    }

    const redemptionPayload = {
      userName: user.username || 'Valued Customer',
      items: items,
      totalPoints: total
    };

    // Trigger PDFKit engine file stream generation write block
    const pdfResult = await generateRedemptionPDF(redemptionPayload);
 
    const now = new Date();
    await CartItemHistory.insertMany(items.map(i => ({
      user: i.user,
      voucher: i.voucher._id,
      quantity: i.quantity,
      timestamp: now
    })));

    // Process database mathematical reductions
    user.points -= total; 
    await user.save();

    // Wipe matching user cart database objects clean
    await CartItem.deleteMany({ user: req.userId });

    const totalVoucherCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    res.status(200).json({ 
      message: 'Redeemed',
      remaining: user.points,
      redemptionCode: totalVoucherCount === 1 && pdfResult.generatedCodes?.[0]
        ? pdfResult.generatedCodes[0]
        : "Multiple Vouchers",
      fileName: pdfResult.filename
     });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
