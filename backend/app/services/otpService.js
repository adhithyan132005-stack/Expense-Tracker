const nodemailer = require('nodemailer');
const twilio = require('twilio');

// ─────────────────────────────────────────
// Generate a 6-digit OTP
// ─────────────────────────────────────────
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────
// Nodemailer Transporter
// ─────────────────────────────────────────
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// ─────────────────────────────────────────
// Send OTP via Email using Nodemailer
// ─────────────────────────────────────────
const sendEmailOTP = async (email, otp) => {
    // For development: Always log the OTP so the user can see it in terminal
    console.log('-----------------------------------------');
    console.log(`📧 EMAIL OTP FOR ${email}: ${otp}`);
    console.log('-----------------------------------------');

    try {
        // Removed placeholder guard so emails actually send
        const transporter = createTransporter();

        const mailOptions = {
            from: `"ExpenseTracker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Your Login OTP - ExpenseTracker',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
                    <h2 style="color: #6c63ff; text-align: center;">ExpenseTracker</h2>
                    <hr style="border: 1px solid #eee;" />
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for login is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #6c63ff; background: #ede9ff; padding: 15px 30px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #888; text-align: center;">⏳ This OTP is valid for <strong>30 seconds</strong> only.</p>
                    <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
                    <hr style="border: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #aaa; text-align: center;">© 2026 ExpenseTracker. All rights reserved.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Nodemailer Error:', error.message);
        console.warn('👉 Use the OTP from the terminal above to log in.');
    }
};

// ─────────────────────────────────────────
// Send OTP via SMS using Twilio
// ─────────────────────────────────────────
const sendSMSOTP = async (phone, otp) => {
    // For development: Always log the OTP
    console.log('-----------------------------------------');
    console.log(`📱 SMS OTP FOR ${phone}: ${otp}`);
    console.log('-----------------------------------------');

    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
            body: `Your ExpenseTracker OTP is: ${otp}. Valid for 30 seconds only.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
    } catch (error) {
        console.error('❌ Twilio Error:', error.message);
        throw new Error('SMS delivery failed. Please check your Twilio settings.');
    }
};

module.exports = { generateOTP, sendEmailOTP, sendSMSOTP };
