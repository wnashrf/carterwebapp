const c = require('../controllers/authController');
const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.get('/profile', auth, c.getProfile);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;