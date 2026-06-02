import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const API_BASE = 'http://localhost:5000/api/auth';

// ══════════════════════════════════════════
// OTP INPUT — split 6-box UI
// ══════════════════════════════════════════
const OTPInput = ({ value, onChange, length = 6 }) => {
    const inputs = useRef([]);

    // Helper to get character at specific index in space-padded string
    const idxToChar = (str, idx) => {
        if (!str) return '';
        return str[idx] && str[idx] !== ' ' ? str[idx] : '';
    };

    const handleChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val && e.target.value !== '') return;

        const newChar = val.substring(val.length - 1);
        const currentOtp = value ? value.split('') : [];
        while (currentOtp.length < length) currentOtp.push(' ');

        currentOtp[index] = newChar || ' ';
        const newOtpString = currentOtp.slice(0, length).join('');
        onChange(newOtpString);

        if (newChar && index < length - 1) {
            setTimeout(() => {
                inputs.current[index + 1]?.focus();
                inputs.current[index + 1]?.setSelectionRange(1, 1);
            }, 10);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!idxToChar(value, index) && index > 0) {
                e.preventDefault();
                const currentOtp = value ? value.split('') : [];
                while (currentOtp.length < length) currentOtp.push(' ');
                currentOtp[index - 1] = ' ';
                onChange(currentOtp.join(''));
                inputs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
        if (data) {
            const paddedData = data.padEnd(length, ' ');
            onChange(paddedData);
            const nextIdx = Math.min(data.length, length - 1);
            setTimeout(() => inputs.current[nextIdx]?.focus(), 10);
        }
    };

    return (
        <div className="otp-boxes">
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    ref={(el) => (inputs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className="otp-box"
                    value={idxToChar(value, idx)}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                />
            ))}
        </div>
    );
};

export default function Login() {
    // ── Login Tab: 'email' | 'phone' | 'social'
    const [activeTab, setActiveTab] = useState('email');

    // ── Email OTP state
    const [email, setEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailStep, setEmailStep] = useState('input'); // 'input' | 'otp'
    const [emailTimer, setEmailTimer] = useState(0);

    // ── Phone OTP state
    const [phone, setPhone] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneStep, setPhoneStep] = useState('input'); // 'input' | 'otp'
    const [phoneTimer, setPhoneTimer] = useState(0);

    // ── UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

    const timerRef = useRef(null);

    // ── OTP Countdown Timer
    const startTimer = (setter) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setter(30);
        timerRef.current = setInterval(() => {
            setter((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // ══════════════════════════════════════════
    // EMAIL OTP HANDLERS
    // ══════════════════════════════════════════
    const handleSendEmailOTP = async (e) => {
        e.preventDefault();
        if (!email.trim()) return showMessage('Please enter your email address.');
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) return showMessage('Please enter a valid email address.');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/email/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setEmailStep('otp');
                startTimer(setEmailTimer);
                showMessage('OTP sent! Check your inbox. Valid for 30 seconds.', 'success');
            } else {
                showMessage(data.message || 'Failed to send OTP.');
            }
        } catch {
            showMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOTP = async (e) => {
        e.preventDefault();
        if (emailOtp.length !== 6) return showMessage('Please enter the full 6-digit OTP.');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/email/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: emailOtp.replace(/\s/g, '') }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => (window.location.href = '/dashboard'), 1500);
            } else {
                showMessage(data.message || 'Invalid OTP.');
            }
        } catch {
            showMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ══════════════════════════════════════════
    // PHONE OTP HANDLERS
    // ══════════════════════════════════════════
    const handleSendPhoneOTP = async (e) => {
        e.preventDefault();
        if (!phone.trim()) return showMessage('Please enter your phone number.');
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phoneRegex.test(phone)) return showMessage('Invalid phone. Use E.164 format (+91...)');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/phone/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.success) {
                setPhoneStep('otp');
                startTimer(setPhoneTimer);
                showMessage('OTP sent to your phone! Valid for 30 seconds.', 'success');
            } else {
                showMessage(data.message || 'Failed to send OTP.');
            }
        } catch {
            showMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPhoneOTP = async (e) => {
        e.preventDefault();
        if (phoneOtp.length !== 6) return showMessage('Please enter the full 6-digit OTP.');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/phone/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp: phoneOtp.replace(/\s/g, '') }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => (window.location.href = '/dashboard'), 1500);
            } else {
                showMessage(data.message || 'Invalid OTP.');
            }
        } catch {
            showMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ══════════════════════════════════════════
    // SOCIAL LOGIN
    // ══════════════════════════════════════════
    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE}/google`;
    };

    const handleGitHubLogin = () => {
        window.location.href = `${API_BASE}/github`;
    };

    return (
        <div className="login-wrapper">
            {/* Background blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">💸</div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your ExpenseTracker account</p>
                </div>

                {/* Tab Switcher */}
                <div className="tab-switcher">
                    {[
                        { id: 'email', icon: '📧', label: 'Email OTP' },
                        { id: 'phone', icon: '📱', label: 'Phone OTP' },
                        { id: 'social', icon: '🌐', label: 'Social' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setMessage({ text: '', type: '' });
                            }}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Message Banner */}
                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                    </div>
                )}

                {/* ─── EMAIL OTP TAB ─── */}
                {activeTab === 'email' && (
                    <div className="tab-content">
                        {emailStep === 'input' ? (
                            <form onSubmit={handleSendEmailOTP} className="login-form">
                                <div className="form-group">
                                    <label htmlFor="email-input" className="form-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📧</span>
                                        <input
                                            id="email-input"
                                            type="email"
                                            className="form-input"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button id="send-email-otp-btn" type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : 'Send OTP to Email'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyEmailOTP} className="login-form">
                                <p className="otp-sent-label">
                                    OTP sent to <strong>{email}</strong>
                                </p>
                                <OTPInput value={emailOtp} onChange={setEmailOtp} />
                                <div className="timer-row">
                                    {emailTimer > 0 ? (
                                        <span className="timer-text">⏳ Expires in <strong>{emailTimer}s</strong></span>
                                    ) : (
                                        <button
                                            id="resend-email-otp-btn"
                                            type="button"
                                            className="resend-btn"
                                            onClick={() => {
                                                setEmailOtp('');
                                                handleSendEmailOTP({ preventDefault: () => { } });
                                            }}
                                        >
                                            🔄 Resend OTP
                                        </button>
                                    )}
                                </div>
                                <button id="verify-email-otp-btn" type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => { setEmailStep('input'); setEmailOtp(''); }}
                                >
                                    ← Change Email
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* ─── PHONE OTP TAB ─── */}
                {activeTab === 'phone' && (
                    <div className="tab-content">
                        {phoneStep === 'input' ? (
                            <form onSubmit={handleSendPhoneOTP} className="login-form">
                                <div className="form-group">
                                    <label htmlFor="phone-input" className="form-label">Mobile Number</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📱</span>
                                        <input
                                            id="phone-input"
                                            type="tel"
                                            className="form-input"
                                            placeholder="+91XXXXXXXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="form-hint">Include country code (e.g. +91 for India)</p>
                                </div>
                                <button id="send-phone-otp-btn" type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : 'Send OTP via SMS'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyPhoneOTP} className="login-form">
                                <p className="otp-sent-label">
                                    OTP sent to <strong>{phone}</strong>
                                </p>
                                <OTPInput value={phoneOtp} onChange={setPhoneOtp} />
                                <div className="timer-row">
                                    {phoneTimer > 0 ? (
                                        <span className="timer-text">⏳ Expires in <strong>{phoneTimer}s</strong></span>
                                    ) : (
                                        <button
                                            id="resend-phone-otp-btn"
                                            type="button"
                                            className="resend-btn"
                                            onClick={() => {
                                                setPhoneOtp('');
                                                handleSendPhoneOTP({ preventDefault: () => { } });
                                            }}
                                        >
                                            🔄 Resend OTP
                                        </button>
                                    )}
                                </div>
                                <button id="verify-phone-otp-btn" type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => { setPhoneStep('input'); setPhoneOtp(''); }}
                                >
                                    ← Change Number
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* ─── SOCIAL TAB ─── */}
                {activeTab === 'social' && (
                    <div className="tab-content social-tab">
                        <p className="social-label">Continue with your social account</p>

                        <button id="google-login-btn" className="social-btn google-btn" onClick={handleGoogleLogin}>
                            <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <button id="github-login-btn" className="social-btn github-btn" onClick={handleGitHubLogin}>
                            <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" />
                            </svg>
                            Continue with GitHub
                        </button>

                        <div className="social-divider">
                            <span>Secure OAuth 2.0 authentication</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="login-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" id="switch-to-register-btn" className="link-btn">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
