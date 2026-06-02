const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { registerValidation, loginValidation } = require('../validation/userValidation');

// ─────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        // Step 1: Validate request body using Joi
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { username, email, password } = req.body;

        // Step 2: Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered. Please login.',
            });
        }

        // Step 3: Hash the password using bcrypt (salt rounds: 10)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Step 4: Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Step 5: Generate a JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Register Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ─────────────────────────────────────────
// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        // Step 1: Validate request body using Joi
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password } = req.body;

        // Step 2: Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.',
            });
        }

        // Step 3: Compare provided password with hashed password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.',
            });
        }

        // Step 4: Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ─────────────────────────────────────────
// @desc    Get current logged-in user profile
// @route   GET /api/auth/profile
// @access  Private (requires authentication middleware)
// ─────────────────────────────────────────
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Profile Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
