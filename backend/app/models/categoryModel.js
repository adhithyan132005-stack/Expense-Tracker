const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['income', 'expense'],
            default: 'expense',
        },
        color: {
            type: String,
            default: '#6c63ff',
        }
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate category names for the same user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
