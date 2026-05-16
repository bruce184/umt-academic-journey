import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyResetPage = () => {
    const { token } = useParams();
    const { verifyPasswordReset } = useAuth();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const hasVerifiedRef = useRef(false);

    useEffect(() => {
        if (!token || hasVerifiedRef.current) {
            return;
        }

        hasVerifiedRef.current = true;

        const verify = async () => {
            try {
                const result = await verifyPasswordReset(token);
                setUsername(result.username);
                setMessage(`Successfully resetting password for account [${result.username}]`);
                setStatus('success');
            } catch (err) {
                setMessage(err.message || 'Failed to verify password reset token.');
                setStatus('error');
            }
        };
        verify();
    }, [token, verifyPasswordReset]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h2>Verification</h2>
                
                {status === 'loading' && <p>Verifying link, please wait...</p>}
                
                {status === 'error' && (
                    <>
                        <div className="error-message">{message}</div>
                        <Link to="/reset-password" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                            <button type="button">Request a new link</button>
                        </Link>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-message">{message}</div>
                        <Link to="/login" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                            <button type="button">Go back to login</button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyResetPage;
