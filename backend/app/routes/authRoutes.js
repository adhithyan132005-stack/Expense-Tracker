const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
    registerUser,
    sendEmailLoginOTP,
    verifyEmailLoginOTP,
    sendPhoneLoginOTP,
    verifyPhoneLoginOTP,
    socialAuthCallback,
    getUserProfile,
} = require('../controllers/authController');

const authenticate = require('../middlewares/authentication');

// ──────────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────────
router.post('/register', registerUser);

// ──────────────────────────────────────────────
// LOGIN VIA EMAIL OTP
// ──────────────────────────────────────────────
router.post('/login/email/send-otp', sendEmailLoginOTP);
router.post('/login/email/verify-otp', verifyEmailLoginOTP);

// ──────────────────────────────────────────────
// LOGIN VIA PHONE OTP (SMS via Twilio)
// ──────────────────────────────────────────────
router.post('/login/phone/send-otp', sendPhoneLoginOTP);
router.post('/login/phone/verify-otp', verifyPhoneLoginOTP);

// ──────────────────────────────────────────────
// GOOGLE OAUTH
// ──────────────────────────────────────────────
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=google_failed`,
        session: false
    }),
    socialAuthCallback
);

// ──────────────────────────────────────────────
// GITHUB OAUTH
// ──────────────────────────────────────────────
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/github/callback',
    passport.authenticate('github', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=github_failed`,
        session: false
    }),
    socialAuthCallback
);

// ──────────────────────────────────────────────
// PROTECTED PROFILE
// ──────────────────────────────────────────────
router.get('/profile', authenticate, getUserProfile);

module.exports = router;
