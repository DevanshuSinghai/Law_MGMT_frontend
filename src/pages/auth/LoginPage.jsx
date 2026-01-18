/**
 * Login page component.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [form] = Form.useForm();
    const { login, error, isLoading, clearError } = useAuthStore();
    const [localError, setLocalError] = useState(null);

    const onFinish = async (values) => {
        setLocalError(null);
        clearError();
        try {
            await login(values.email, values.password);
        } catch (err) {
            setLocalError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Welcome Back
                </Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            {(error || localError) && (
                <Alert
                    title={error || localError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                    closable
                    onClose={() => {
                        clearError();
                        setLocalError(null);
                    }}
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
                        placeholder="Email"
                        autoComplete="email"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        Sign In
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>
                <Text type="secondary">Don't have an account?</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
                <Link to="/register">
                    <Button type="link">Register your firm</Button>
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
