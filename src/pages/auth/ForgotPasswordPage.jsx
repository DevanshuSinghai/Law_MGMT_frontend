/**
 * Forgot Password page - request password reset email.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { authApi } from '../../api';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const onFinish = async (values) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.requestPasswordReset(values.email);
            setIsSuccess(true);
        } catch (err) {
            alert("No account found with that email.")
            setError(err.response?.data?.error || 'Failed to send reset email. Either User not exists or some error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Result
                status="success"
                title="Check Your Email"
                subTitle="If an account with that email exists, we've sent a password reset link. Please check your inbox (and spam folder)."
                extra={[
                    <Link to="/login" key="login">
                        <Button type="primary">Back to Login</Button>
                    </Link>,
                ]}
            />
        );
    }

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Forgot Password?
                </Title>
                <Text type="secondary">
                    Enter your email address and we'll send you a link to reset your password.
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
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email address"
                        autoComplete="email"
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        Send Reset Link
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                    <Button type="link" icon={<ArrowLeftOutlined />}>
                        Back to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
