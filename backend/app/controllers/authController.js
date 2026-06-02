const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateOTP, sendEmailOTP, sendSMSOTP } = require('../services/otpService');
const { registerValidation } = require('../validation/userValidation');

// ─────────────────────────────────────────
// Helper: Generate JWT token
// ─────────────────────────────────────────
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ═══════════════════════════════════════════════════════════
// REGISTER
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ═══════════════════════════════════════════════════════════
const registerUser = async (req, res) => {
    try {
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { username, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered. Please login.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            loginMethod: 'email',
        });

        await newUser.save();

        const token = generateToken(newUser);

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
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ═══════════════════════════════════════════════════════════
// EMAIL OTP - SEND
// @desc    Send OTP to user's email
// @route   POST /api/auth/login/email/send-otp
// @access  Public
// ═══════════════════════════════════════════════════════════
const sendEmailLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email. Please register first.',
            });
        }

        // Generate OTP (valid for 30 seconds)
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 30 * 1000); // 30 seconds

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        await sendEmailOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Valid for 30 seconds.',
        });
    } catch (error) {
        console.error('Send Email OTP Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
    }
};

// ═══════════════════════════════════════════════════════════
// EMAIL OTP - VERIFY
// @desc    Verify OTP sent to email and log in
// @route   POST /api/auth/login/email/verify-otp
// @access  Public
// ═══════════════════════════════════════════════════════════
const verifyEmailLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check OTP
        if (!user.otp || user.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // Check OTP expiry (30 seconds)
        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid — clear it
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        await user.save();

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful via Email OTP',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Verify Email OTP Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ═══════════════════════════════════════════════════════════
// PHONE OTP - SEND
// @desc    Send OTP to user's mobile number via Twilio
// @route   POST /api/auth/login/phone/send-otp
// @access  Public
// ═══════════════════════════════════════════════════════════
const sendPhoneLoginOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Basic phone validation (E.164 format recommended: +91XXXXXXXXXX)
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Use E.164 format (e.g. +91XXXXXXXXXX)',
            });
        }

        // Find or create user
        let user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number. Please register first.',
            });
        }

        // Generate OTP (valid for 30 seconds)
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 30 * 1000); // 30 seconds

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP via Twilio SMS
        await sendSMSOTP(phone, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your phone. Valid for 30 seconds.',
        });
    } catch (error) {
        console.error('Send Phone OTP Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
    }
};

// ═══════════════════════════════════════════════════════════
// PHONE OTP - VERIFY
// @desc    Verify OTP sent to phone and log in
// @route   POST /api/auth/login/phone/verify-otp
// @access  Public
// ═══════════════════════════════════════════════════════════
const verifyPhoneLoginOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check OTP
        if (!user.otp || user.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // Check OTP expiry (30 seconds)
        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid — clear it
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        await user.save();

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful via Phone OTP',
            token,
            user: {
                id: user._id,
                username: user.username,
                phone: user.phone,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Verify Phone OTP Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ═══════════════════════════════════════════════════════════
// SOCIAL AUTH CALLBACK - shared handler for Google & GitHub
// @desc    Called after Passport OAuth success; returns JWT
// @route   GET /api/auth/google/callback | /api/auth/github/callback
// @access  Public
// ═══════════════════════════════════════════════════════════
const socialAuthCallback = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=social_auth_failed`
            );
        }

        const token = generateToken(user);

        // Prepare simple user object to send to frontend
        const userObj = JSON.stringify({
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar
        });

        // Redirect to frontend with token and encoded user object
        return res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${encodeURIComponent(userObj)}`
        );
    } catch (error) {
        console.error('Social Auth Callback Error:', error.message);
        return res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`
        );
    }
};

// ═══════════════════════════════════════════════════════════
// GET USER PROFILE
// @desc    Get current logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
// ═══════════════════════════════════════════════════════════
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Profile Error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    sendEmailLoginOTP,
    verifyEmailLoginOTP,
    sendPhoneLoginOTP,
    verifyPhoneLoginOTP,
    socialAuthCallback,
    getUserProfile,
};
