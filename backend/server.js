require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('./config/passport');

// Import Routes
const authRoutes = require('./app/routes/authRoutes');
const categoryRoutes = require('./app/routes/categoryRoutes');
const expenseRoutes = require('./app/routes/expenseRoutes');

const app = express();

// ── CORS ────────────────────────────────────────────
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5173'
        ],
        credentials: true,
    })
);

// ── Body Parsers ─────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session (required by Passport) ───────────────────
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'express_session_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);

// ── Passport Middleware ──────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Connect to MongoDB ───────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);

// ── Health Check ─────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: '✅ ExpenseTracker API is running!' });
});

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
