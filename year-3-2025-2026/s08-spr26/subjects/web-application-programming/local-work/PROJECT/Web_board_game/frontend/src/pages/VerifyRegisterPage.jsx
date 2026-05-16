import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyRegisterPage = () => {
    const { token } = useParams();
    const { verifyRegister } = useAuth();
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
                const result = await verifyRegister(token);
                setUsername(result.username);
                setMessage(`Successfully created account for [${result.username}]!`);
                setStatus('success');
            } catch (err) {
                setMessage(err.message || 'Failed to verify registration token.');
                setStatus('error');
            }
        };
        verify();
    }, [token, verifyRegister]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h2>Verify Registration</h2>
                
                {status === 'loading' && <p>Verifying link, please wait...</p>}
                
                {status === 'error' && (
                    <>
                        <div className="error-message">{message}</div>
                        <Link to="/register" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                            <button type="button">Register again</button>
                        </Link>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-message">{message}</div>
                        <Link to="/login" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                            <button type="button">Go to login</button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyRegisterPage;
