const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
        },
        // Social OAuth IDs
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        githubId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatar: {
            type: String,
        },
        // OTP Fields
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        loginMethod: {
            type: String,
            enum: ['email', 'phone', 'google', 'github'],
            default: 'email',
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
