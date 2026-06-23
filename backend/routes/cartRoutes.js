const router = require('express').Router();
const c = require('../controllers/cartController');
const redeemController = require('../controllers/redeemController');
const RedeemedVoucher = require('../models/RedeemedVoucher');
const auth = require('../middleware/auth');

router.post('/', auth, c.addToCart);
router.get('/user', auth, c.getCartForUser);
router.post('/redeem', auth, redeemController.redeem);
router.post('/redeem-single', auth, redeemController.redeemSingle);
router.patch('/:id', auth, c.updateQuantity);
router.delete('/:id', auth, c.deleteFromCart);
router.get('/history', auth, async (req, res) => {
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
