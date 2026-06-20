const router = require('express').Router();
const c = require('../controllers/cartController');

router.post('/', c.addToCart);
router.get('/user/:userId', c.getCartForUser);
router.patch('/:id', c.updateQuantity);
router.delete('/:id', c.deleteFromCart);

module.exports = router;
