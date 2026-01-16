/**
 * Register page for firm self-registration.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Divider, Steps } from 'antd';
import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    BankOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [form] = Form.useForm();
    const { registerFirm, error, isLoading, clearError } = useAuthStore();
    const [localError, setLocalError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const onFinish = async (values) => {
        setLocalError(null);
        clearError();

        const firmData = {
            // User data
            email: values.email,
            password: values.password,
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone || '',
            // Firm data
            firm_name: values.firm_name,
            firm_address: values.firm_address || '',
            firm_phone: values.firm_phone || '',
            firm_website: values.firm_website || '',
        };

        try {
            await registerFirm(firmData);
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = 'Registration failed. Please try again.';

            if (errorData) {
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else {
                    // Get first error from object
                    const firstKey = Object.keys(errorData)[0];
                    const firstError = errorData[firstKey];
                    errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                }
            }

            setLocalError(errorMessage);
        }
    };

    const steps = [
        { title: 'User Info', icon: <UserOutlined /> },
        { title: 'Firm Info', icon: <BankOutlined /> },
    ];

    const nextStep = async () => {
        try {
            if (currentStep === 0) {
                await form.validateFields(['email', 'password', 'password_confirm', 'first_name', 'last_name']);
            }
            setCurrentStep(currentStep + 1);
        } catch {
            // Validation failed
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Register Your Firm
                </Title>
                <Text type="secondary">Create your firm account to get started</Text>
            </div>

            <Steps current={currentStep} items={steps} size="small" style={{ marginBottom: 24 }} />

            {(error || localError) && (
                <Alert
                    message={error || localError}
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
                {/* Step 1: User Info */}
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="first_name"
                            rules={[{ required: true, message: 'Required' }]}
                            style={{ flex: 1 }}
                        >
                            <Input prefix={<UserOutlined />} placeholder="First Name" />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            rules={[{ required: true, message: 'Required' }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Last Name" />
                        </Form.Item>
                    </div>

                    <Form.Item name="phone">
                        <Input prefix={<PhoneOutlined />} placeholder="Phone (optional)" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter a password' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="password_confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Button type="primary" block onClick={nextStep}>
                        Next
                    </Button>
                </div>

                {/* Step 2: Firm Info */}
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <Form.Item
                        name="firm_name"
                        rules={[{ required: true, message: 'Please enter your firm name' }]}
                    >
                        <Input prefix={<BankOutlined />} placeholder="Firm Name" />
                    </Form.Item>

                    <Form.Item name="firm_address">
                        <Input prefix={<EnvironmentOutlined />} placeholder="Address (optional)" />
                    </Form.Item>

                    <Form.Item name="firm_phone">
                        <Input prefix={<PhoneOutlined />} placeholder="Firm Phone (optional)" />
                    </Form.Item>

                    <Form.Item name="firm_website">
                        <Input placeholder="Website (optional)" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Button block onClick={prevStep}>
                            Back
                        </Button>
                        <Button type="primary" htmlType="submit" block loading={isLoading}>
                            Register
                        </Button>
                    </div>
                </div>
            </Form>

            <Divider plain>
                <Text type="secondary">Already have an account?</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                    <Button type="link">Sign in</Button>
                </Link>
            </div>
        </div>
    );
};

export default RegisterPage;
