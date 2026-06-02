const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createExpense, getExpenses, extractExpenseInfo, updateExpense, deleteExpense } = require('../controllers/expenseController');
const authenticate = require('../middlewares/authentication');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

router.use(authenticate);

router.post('/', createExpense);
router.get('/', getExpenses);
router.post('/extract', upload.single('file'), extractExpenseInfo);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
