import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css';

const { Title } = Typography;

const Login = () => {
    const { login, isLoading, user, error: authError } = useAuthStore();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const onFinish = async (values) => {
        setLocalError('');
        try {
            await login(values.email, values.password);
        } catch (err) {
            setLocalError(err.message || 'Login failed');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-shell">
                <div className="login-brand">
                    <div className="login-badge">Admin Console</div>
                    <Title level={2} className="login-brand-title">
                        Manage Outstagram with a cleaner, safer control panel.
                    </Title>
                    <p className="login-brand-copy">
                        Review reports, moderate content, and keep the platform stable from one unified admin workspace.
                    </p>
                    <div className="login-brand-points">
                        <span>Content moderation</span>
                        <span>User safety</span>
                        <span>System control</span>
                    </div>
                </div>

                <Card className="login-card" variant="borderless">
                    <div className="login-header">
                        <div className="login-eyebrow">Welcome back</div>
                        <Title level={3}>Sign in to Admin</Title>
                        <p>Use your admin account to access the control center.</p>
                    </div>

                    {(localError || authError) && (
                        <Alert message={localError || authError} type="error" showIcon className="login-alert" />
                    )}

                    <Form name="admin_login" onFinish={onFinish} layout="vertical">
                        <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default Login;
