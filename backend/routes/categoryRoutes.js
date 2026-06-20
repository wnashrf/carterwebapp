const express = require('express');
const router = express.Router();
const c = require('../controllers/categoryController');

// Get all categories
router.get('/', c.getAllCategories);

// Get category by ID
router.get('/:id', c.getCategoryById);

// Create new category
router.post('/', c.createCategory);

module.exports = router;

