// controllers/redeemController.js
const CartItem = require('../models/CartItem');
const User = require('../models/User');
const CartItemHistory = require('../models/CartItemHistory');
const Voucher = require('../models/Voucher');
const RedeemedVoucher = require('../models/RedeemedVoucher');
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

    const walletInserts = [];
    let codeIndex = 0;
    
    for (const item of items) {
      for (let q = 0; q < item.quantity; q++) {
        // Fall back to a structural fallback if multiple code indices aren't present
        const code = pdfResult.generatedCodes?.[codeIndex] || `V-${~~(Math.random()*100000)}`;
        
        walletInserts.push({
          user: req.userId,
          voucher: item.voucher._id,
          uniqueCode: code,
          isUsed: false,
          redeemedAt: now
        });
        codeIndex++;
      }
    }
    await RedeemedVoucher.insertMany(walletInserts);

    // Process database mathematical reductions
    user.points -= total; 
    await user.save();

    // Wipe matching user cart database objects clean
    await CartItem.deleteMany({ user: req.userId });

    const totalVoucherCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const pdfBase64 = pdfResult.pdfBuffer.toString('base64');

    res.status(200).json({ 
      message: 'Redeemed',
      remaining: user.points,
      redemptionCode: totalVoucherCount === 1 && pdfResult.generatedCodes?.[0]
        ? pdfResult.generatedCodes[0]
        : "Multiple Vouchers",
      fileName: pdfResult.filename,
      pdfFile: pdfBase64
     });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.redeemSingle = async (req, res) => {
  try {
    const { voucherId } = req.body;
    if (!voucherId) {
      return res.status(400).json({ message: 'Voucher ID is required' });
    }

    // Fetch the raw voucher document directly
    const voucher = await Voucher.findById(voucherId).populate('category_id');
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.points < voucher.points) {
      return res.status(400).json({ message: `Not enough points. You need ${voucher.points} pts.` });
    }

    // Mimic the items array format expected by your native pdfGenerator engine
    const mockItem = {
      voucher: voucher,
      quantity: 1
    };

    const redemptionPayload = {
      userName: user.username || 'Valued Customer',
      items: [mockItem],
      totalPoints: voucher.points
    };

    // Trigger file stream generation
    const pdfResult = await generateRedemptionPDF(redemptionPayload);
    const now = new Date();

    // Save transaction directly into your existing history tracking log
    await CartItemHistory.create({
      user: req.userId,
      voucher: voucher._id,
      quantity: 1,
      timestamp: now
    });

    const finalCode = pdfResult.generatedCodes?.[0] || `V-${~~(Math.random()*100000)}`;
    await RedeemedVoucher.create({
      user: req.userId,
      voucher: voucher._id,
      uniqueCode: finalCode,
      isUsed: false,
      redeemedAt: now
    });

    // Deduct exact points balance
    user.points -= voucher.points;
    await user.save();

    const pdfBase64 = pdfResult.pdfBuffer.toString('base64');

    res.status(200).json({
      message: 'Redeemed successfully',
      remaining: user.points,
      redemptionCode: pdfResult.generatedCodes?.[0] || "VOUCHER-ERR",
      fileName: pdfResult.filename,
      pdfFile: pdfBase64
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};