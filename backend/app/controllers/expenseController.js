const Expense = require('../models/expenseModel');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = require('path');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, amount, and category',
            });
        }

        const expense = new Expense({
            title,
            amount,
            category,
            date: date || Date.now(),
            description,
            user: req.user.id
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            expense
        });
    } catch (error) {
        console.error('Create Expense Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// @desc    Get all expenses for a user (with pagination)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Expense.countDocuments({ user: req.user.id });
        const expenses = await Expense.find({ user: req.user.id })
            .populate('category', 'name')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            expenses,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get Expenses Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description } = req.body;
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount, category, date, description },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, expense });
    } catch (error) {
        console.error('Update Expense Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ success: true, message: 'Expense removed' });
    } catch (error) {
        console.error('Delete Expense Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Extract information from uploaded file
// @route   POST /api/expenses/extract
// @access  Private
const extractExpenseInfo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let fileContent = '';
        let extractedData = {};

        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            // Use Tesseract ORC for images
            const result = await Tesseract.recognize(filePath, 'eng');
            fileContent = result.data.text;
        } else {
            // Handle JSON, CSV, Text
            fileContent = fs.readFileSync(filePath, 'utf8');
        }

        if (ext === '.json') {
            try {
                extractedData = JSON.parse(fileContent);
            } catch (err) {
                console.error("JSON Parse Error");
            }
        } else if (ext === '.csv') {
            const lines = fileContent.split('\n');
            if (lines.length > 1) {
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const values = lines[1].split(',').map(v => v.trim());

                const titleIdx = headers.indexOf('title');
                const amountIdx = headers.indexOf('amount');
                const dateIdx = headers.indexOf('date');

                if (titleIdx !== -1) extractedData.title = values[titleIdx];
                if (amountIdx !== -1) extractedData.amount = parseFloat(values[amountIdx]);
                if (dateIdx !== -1) extractedData.date = values[dateIdx];
            }
        } else {
            // Robust parsing for OCR results and original text
            // Sanitize: common OCR mistakes
            const sanitizedText = fileContent
                .replace(/[OI]/g, (m) => m === 'O' ? '0' : '1') // basic numeric context sanitization
                .replace(/[,]/g, '.'); // common decimal separator error

            // 1. DATE EXTRACTION
            // Handles YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, etc.
            const datePatterns = [
                /(\d{4}[-/]\d{2}[-/]\d{2})/,             // 2026-02-27
                /(\d{2}[-/]\d{2}[-/]\d{4})/,             // 27-02-2026
                /(\d{1,2}\s+[A-Za-z]{3,}\s+\d{4})/       // 27 Feb 2026
            ];

            for (let pattern of datePatterns) {
                const match = fileContent.match(pattern);
                if (match) {
                    extractedData.date = match[0].replace(/\//g, '-');
                    break;
                }
            }

            // 2. AMOUNT EXTRACTION
            // Look for "Total" and variants with common OCR errors (T0tal, Tatal, etc.)
            const amountPatterns = [
                /(?:Total|T[o0a]t[a]l|Amount|Sum|Grand\s+T[o0a]t[a]l|Net|Payable|Paid):\s*[$₹s]?\s*(\d+[\.\s]?\d{0,2})/i,
                /(?:Total|Amount|Sum|Paid)\s*[:]?\s*(\d+\.\d{2})/i
            ];

            let foundAmount = null;
            for (let pattern of amountPatterns) {
                const match = fileContent.match(pattern);
                if (match) {
                    foundAmount = parseFloat(match[1].replace(/\s/g, ''));
                    break;
                }
            }

            // Fallback: Smart amount detection - look for the largest number in the document
            if (!foundAmount) {
                const allNumbers = fileContent.match(/\d+\.\d{2}/g);
                if (allNumbers) {
                    const sorted = allNumbers.map(n => parseFloat(n)).sort((a, b) => b - a);
                    if (sorted[0]) foundAmount = sorted[0];
                }
            }
            extractedData.amount = foundAmount;

            // 3. VENDOR / TITLE EXTRACTION
            const vendorPatterns = [
                /(?:Vendor|Store|Store Name|Shop|Merchant):\s*(.*)/i,
                /([A-Z][A-Za-z&\s]{3,}(?:Inc|Ltd|Pvt|Store|Shop|Mart|Cafe|Restaurant|Bakery))/i
            ];

            let foundTitle = null;
            for (let pattern of vendorPatterns) {
                const match = fileContent.match(pattern);
                if (match) {
                    foundTitle = match[1].trim();
                    break;
                }
            }

            if (!foundTitle) {
                // Heuristic: Use the first non-numeric line as the vendor
                const lines = fileContent.split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 3 && !/^\d+$/.test(l) && !/DATE|TIME|INVOICE|ORDER|CASHIER/i.test(l));
                foundTitle = lines[0] || "Unknown Merchant";
            }
            extractedData.title = foundTitle;
        }

        // Clean up file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            success: true,
            data: extractedData
        });
    } catch (error) {
        console.error('Extraction Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to extract information' });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    extractExpenseInfo,
    updateExpense,
    deleteExpense
};
