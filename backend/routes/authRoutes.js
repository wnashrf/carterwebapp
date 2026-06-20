const c = require('../controllers/authController');
const router = require('express').Router();

router.post('/signup', c.signup);
router.post('/login', c.login);

module.exports = router;