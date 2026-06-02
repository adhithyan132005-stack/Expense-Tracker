import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const API_BASE = 'http://localhost:5000/api/auth';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-4

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // ── Password strength calculation
    const calcPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 4);
    };

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

    // ── Field Change Handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }

        if (name === 'password') {
            setPasswordStrength(calcPasswordStrength(value));
        }
    };

    // ── Client-side Validation
    const validate = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
            newErrors.username = 'Must be at least 3 characters';
        } else if (formData.username.trim().length > 30) {
            newErrors.username = 'Must be under 30 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (formData.phone && !/^\+[1-9]\d{6,14}$/.test(formData.phone)) {
            newErrors.phone = 'Use E.164 format (e.g. +91XXXXXXXXXX)';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Minimum 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            };
            if (formData.phone.trim()) {
                payload.phone = formData.phone.trim();
            }

            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Account created successfully! Redirecting...', 'success');
                setTimeout(() => (window.location.href = '/dashboard'), 1500);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.');
            }
        } catch {
            showMessage('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            {/* Background blobs */}
            <div className="reg-blob reg-blob-1" />
            <div className="reg-blob reg-blob-2" />
            <div className="reg-blob reg-blob-3" />

            <div className="register-card">
                {/* Header */}
                <div className="register-header">
                    <div className="register-logo">📝</div>
                    <h1 className="register-title">Create Account</h1>
                    <p className="register-subtitle">Start tracking your expenses today</p>
                </div>

                {/* Message Banner */}
                {message.text && (
                    <div className={`reg-message-banner ${message.type}`}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="register-form" noValidate>

                    {/* Username */}
                    <div className="reg-form-group">
                        <label htmlFor="reg-username" className="reg-label">
                            Username <span className="required-star">*</span>
                        </label>
                        <div className="reg-input-wrapper">
                            <span className="reg-input-icon">👤</span>
                            <input
                                id="reg-username"
                                name="username"
                                type="text"
                                className={`reg-input ${errors.username ? 'input-error' : formData.username ? 'input-success' : ''}`}
                                placeholder="e.g. john_doe"
                                value={formData.username}
                                onChange={handleChange}
                                maxLength={30}
                                autoComplete="username"
                            />
                            {formData.username && !errors.username && (
                                <span className="input-check">✓</span>
                            )}
                        </div>
                        {errors.username && <p className="reg-error">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div className="reg-form-group">
                        <label htmlFor="reg-email" className="reg-label">
                            Email Address <span className="required-star">*</span>
                        </label>
                        <div className="reg-input-wrapper">
                            <span className="reg-input-icon">📧</span>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                className={`reg-input ${errors.email ? 'input-error' : formData.email && !errors.email ? 'input-success' : ''}`}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                            {formData.email && !errors.email && (
                                <span className="input-check">✓</span>
                            )}
                        </div>
                        {errors.email && <p className="reg-error">{errors.email}</p>}
                    </div>

                    {/* Phone (Optional) */}
                    <div className="reg-form-group">
                        <label htmlFor="reg-phone" className="reg-label">
                            Phone Number <span className="optional-tag">Optional</span>
                        </label>
                        <div className="reg-input-wrapper">
                            <span className="reg-input-icon">📱</span>
                            <input
                                id="reg-phone"
                                name="phone"
                                type="tel"
                                className={`reg-input ${errors.phone ? 'input-error' : ''}`}
                                placeholder="+91XXXXXXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                            />
                        </div>
                        {errors.phone && <p className="reg-error">{errors.phone}</p>}
                        {!errors.phone && (
                            <p className="reg-hint">Required for phone OTP login (E.164 format)</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="reg-form-group">
                        <label htmlFor="reg-password" className="reg-label">
                            Password <span className="required-star">*</span>
                        </label>
                        <div className="reg-input-wrapper">
                            <span className="reg-input-icon">🔒</span>
                            <input
                                id="reg-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className={`reg-input reg-input-pad-right ${errors.password ? 'input-error' : formData.password && !errors.password ? 'input-success' : ''}`}
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                id="toggle-password-btn"
                                type="button"
                                className="toggle-eye-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {/* Password Strength Bar */}
                        {formData.password && (
                            <div className="strength-wrapper">
                                <div className="strength-bar">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className="strength-segment"
                                            style={{
                                                background: passwordStrength >= level
                                                    ? strengthColors[passwordStrength]
                                                    : 'rgba(255,255,255,0.1)',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: strengthColors[passwordStrength] }}>
                                    {strengthLabels[passwordStrength]}
                                </span>
                            </div>
                        )}
                        {errors.password && <p className="reg-error">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="reg-form-group">
                        <label htmlFor="reg-confirm-password" className="reg-label">
                            Confirm Password <span className="required-star">*</span>
                        </label>
                        <div className="reg-input-wrapper">
                            <span className="reg-input-icon">🔐</span>
                            <input
                                id="reg-confirm-password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className={`reg-input reg-input-pad-right ${errors.confirmPassword
                                    ? 'input-error'
                                    : formData.confirmPassword && formData.password === formData.confirmPassword
                                        ? 'input-success'
                                        : ''
                                    }`}
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                id="toggle-confirm-password-btn"
                                type="button"
                                className="toggle-eye-btn"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="reg-error">{errors.confirmPassword}</p>}
                    </div>

                    {/* Terms note */}
                    <p className="terms-text">
                        By creating an account you agree to our{' '}
                        <a href="#" className="terms-link">Terms of Service</a> and{' '}
                        <a href="#" className="terms-link">Privacy Policy</a>.
                    </p>

                    {/* Submit */}
                    <button
                        id="register-submit-btn"
                        type="submit"
                        className="reg-btn-primary"
                        disabled={loading}
                    >
                        {loading ? <span className="reg-spinner" /> : null}
                        {loading ? 'Creating Account...' : '🚀 Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className="reg-divider">
                    <span>or register with</span>
                </div>

                {/* Social Register Shortcuts */}
                <div className="reg-social-row">
                    <a
                        id="reg-google-btn"
                        href="http://localhost:5000/api/auth/google"
                        className="reg-social-btn reg-google"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </a>
                    <a
                        id="reg-github-btn"
                        href="http://localhost:5000/api/auth/github"
                        className="reg-social-btn reg-github"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" />
                        </svg>
                        GitHub
                    </a>
                </div>

                {/* Footer */}
                <div className="register-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/" id="switch-to-login-btn" className="reg-link-btn">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
