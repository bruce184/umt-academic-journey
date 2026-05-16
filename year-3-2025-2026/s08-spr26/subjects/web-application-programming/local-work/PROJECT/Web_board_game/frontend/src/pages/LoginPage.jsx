import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            // Redirect based on role
            if (user.role === 'admin') navigate('/admin');
            else navigate('/hub');
        } catch (err) {
            setError(err.message || 'Failed to login');
            // Per requirements, we can "refresh" state or just show error
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>
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
                    
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Log In</button>
                </form>
                <div className="auth-links">
                    <Link to="/reset-password">Forgot password?</Link>
                    <span>Don't have an account? <Link to="/register">Register here</Link></span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
