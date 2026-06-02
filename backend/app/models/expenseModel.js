const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
