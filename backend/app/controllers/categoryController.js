const Category = require('../models/categoryModel');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const { name, type, color } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        // Check if category already exists for this user
        const existingCategory = await Category.findOne({ name, user: req.user.id });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }

        const category = new Category({
            name,
            type: type || 'expense',
            color: color || '#6c63ff',
            user: req.user.id
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create Category Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.id });
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get Categories Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        const { name, type, color } = req.body;
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (category.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, type, color },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, category });
    } catch (error) {
        console.error('Update Category Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (category.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await category.deleteOne();

        res.status(200).json({ success: true, message: 'Category removed' });
    } catch (error) {
        console.error('Delete Category Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
