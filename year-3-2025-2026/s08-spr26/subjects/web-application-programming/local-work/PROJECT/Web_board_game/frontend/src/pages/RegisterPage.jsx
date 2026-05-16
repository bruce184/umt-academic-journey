import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username.length < 3) return setError('Username must be at least 3 characters long');
        if (password.length < 3) return setError('Password must be at least 3 characters long');
        if (password !== confirmPassword) return setError('Passwords do not match');
        if (!email.includes('@')) return setError('Invalid email format');

        try {
            await register(username, email, password);
            setIsEmailSent(true);
        } catch (err) {
            setError(err.message || 'Failed to register');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Register</h2>
                {isEmailSent ? (
                    <div className="success-message" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <p>We've sent a verification to email <strong>{email}</strong>.</p>
                        <p>Please click the link in the email to complete your registration. Link expires in 15 minutes.</p>
                        <Link to="/login" style={{ marginTop: '1rem' }}>
                            <button type="button">Go back to login</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit} className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Choose a username (>3 chars)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            {username.length > 0 && username.length < 3 && <span className="input-error-label">Username must be at least 3 characters long</span>}
                            
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {email.length > 0 && !email.includes('@') && <span className="input-error-label">Email must contain '@'</span>}

                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Create a password (>3 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {password.length > 0 && password.length < 3 && <span className="input-error-label">Password must be at least 3 characters long</span>}

                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Create Account</button>
                        </form>
                        <div className="auth-links">
                            <Link to="/login">Already have an account? Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
