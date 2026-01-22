/**
 * Reset Password page - set new password using token from email.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Result, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authApi } from '../../api';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const onFinish = async (values) => {
        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await authApi.confirmPasswordReset(token, values.new_password);
            setIsSuccess(true);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.new_password?.[0] ||
                'Failed to reset password. The link may have expired.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Result
                status="success"
                title="Password Reset Successful!"
                subTitle="Your password has been changed. You can now log in with your new password."
                extra={[
                    <Button type="primary" key="login" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>,
                ]}
            />
        );
    }

    if (!token) {
        return (
            <Result
                status="error"
                title="Invalid Reset Link"
                subTitle="This password reset link is invalid or has expired. Please request a new one."
                extra={[
                    <Link to="/forgot-password" key="forgot">
                        <Button type="primary">Request New Reset Link</Button>
                    </Link>,
                    <Link to="/login" key="login">
                        <Button>Back to Login</Button>
                    </Link>,
                ]}
            />
        );
    }

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Set New Password
                </Title>
                <Text type="secondary">
                    Please enter your new password below.
                </Text>
            </div>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                    closable
                    onClose={() => setError(null)}
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                size="large"
            >
                <Form.Item
                    name="new_password"
                    rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="New Password"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirm_password"
                    dependencies={['new_password']}
                    rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('new_password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm New Password"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        Reset Password
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                    <Button type="link">Back to Login</Button>
                </Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
