const router = require('express').Router();
const { getAllCategories, getCategoryById, createCategory } = require('../controllers/categoryController');
const verifyToken = require('../middleware/auth');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, createCategory);

module.exports = router;