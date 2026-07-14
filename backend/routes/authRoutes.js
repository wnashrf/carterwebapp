const router = require('express').Router();
const { getProfile, updateProfile, signup, login } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;