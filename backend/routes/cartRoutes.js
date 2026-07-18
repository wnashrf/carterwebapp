const router = require('express').Router();
const { addToCart, getCartForUser, updateQuantity, deleteFromCart } = require('../controllers/cartController');
const { redeem, redeemSingle } = require('../controllers/redeemController');
const RedeemedVoucher = require('../models/RedeemedVoucher');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, addToCart);
router.get('/user', verifyToken, getCartForUser);
router.post('/redeem', verifyToken, redeem);
router.post('/redeem-single', verifyToken, redeemSingle);
router.patch('/:id', verifyToken, updateQuantity);
router.delete('/:id', verifyToken, deleteFromCart);

router.get('/history', verifyToken, async (req, res) => {
  try {
    const walletItems = await RedeemedVoucher.find({ user: req.userId })
      .populate({ path: 'voucher', populate: { path: 'category_id' } })
      .sort({ createdAt: -1 });
    res.status(200).json(walletItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;