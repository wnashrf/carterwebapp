const c = require('../controllers/authController');
const router = require('express').Router();
const auth = require('../middleware/auth');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.get('/profile', auth, c.getProfile);

module.exports = router;