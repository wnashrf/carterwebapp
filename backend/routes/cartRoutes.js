const router = require('express').Router();
const c = require('../controllers/cartController');
const redeemController = require('../controllers/redeemController');
const auth = require('../middleware/auth');

router.post('/', auth, c.addToCart);
router.get('/user', auth, c.getCartForUser);
router.post('/redeem', auth, redeemController.redeem);
router.patch('/:id', auth, c.updateQuantity);
router.delete('/:id', auth, c.deleteFromCart);

module.exports = router;
