import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { requestPasswordReset } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 3) return setError('Password must be at least 3 characters long');
        if (newPassword !== confirmPassword) return setError('Passwords do not match');
        if (!email.includes('@')) return setError('Invalid email format');

        try {
            await requestPasswordReset(email, newPassword);
            setIsEmailSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                {isEmailSent ? (
                    <div className="success-message" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <p>We've sent a verification to email <strong>{email}</strong>.</p>
                        <p>Please click the link in the email to complete the reset. Link expires in 10 minutes.</p>
                        <Link to="/login" style={{ marginTop: '1rem' }}>
                            <button type="button">Go back to login</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit} className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {email.length > 0 && !email.includes('@') && <span className="input-error-label">Email must contain '@'</span>}

                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password (min. 3 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            {newPassword.length > 0 && newPassword.length < 3 && <span className="input-error-label">Password must be at least 3 characters long</span>}

                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Send Verification Link</button>
                        </form>
                        <div className="auth-links">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
