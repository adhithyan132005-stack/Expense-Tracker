const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authenticate = require('../middlewares/authentication');

// All category routes are protected
router.post('/', authenticate, createCategory);
router.get('/', authenticate, getCategories);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

module.exports = router;
