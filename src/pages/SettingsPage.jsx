/**
 * Settings page for user profile and preferences.
 */

import { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Row,
    Col,
    Avatar,
    Descriptions,
    Tag,
} from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores';
import { authApi } from '../api';

const { Title, Text } = Typography;

const SettingsPage = () => {
    const { user, updateUser } = useAuthStore();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const handleProfileUpdate = async (values) => {
        setUpdatingProfile(true);
        try {
            const updatedUser = await authApi.updateProfile(values);
            updateUser(updatedUser);
            message.success('Profile updated successfully');
        } catch (error) {
            message.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setChangingPassword(true);
        try {
            await authApi.changePassword(values.old_password, values.new_password);
            message.success('Password changed successfully');
            passwordForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            super_admin: 'red',
            firm_manager: 'purple',
            lawyer: 'blue',
            paralegal: 'cyan',
            staff: 'default',
        };
        return colors[role] || 'default';
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Settings</Title>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    {/* Profile Section */}
                    <Card
                        title={
                            <span>
                                <UserOutlined style={{ marginRight: 8 }} />
                                Profile Information
                            </span>
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <div style={{ marginBottom: 24 }}>
                            <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>{user?.full_name}</Title>
                                <Text type="secondary">{user?.email}</Text>
                            </div>
                        </div>

                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleProfileUpdate}
                            initialValues={{
                                first_name: user?.first_name,
                                last_name: user?.last_name,
                                phone: user?.phone,
                            }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="first_name"
                                        label="First Name"
                                        rules={[{ required: true }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="last_name"
                                        label="Last Name"
                                        rules={[{ required: true }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="phone" label="Phone">
                                <Input />
                            </Form.Item>

                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                htmlType="submit"
                                loading={updatingProfile}
                            >
                                Save Changes
                            </Button>
                        </Form>
                    </Card>

                    {/* Password Section */}
                    <Card
                        title={
                            <span>
                                <LockOutlined style={{ marginRight: 8 }} />
                                Change Password
                            </span>
                        }
                    >
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                        >
                            <Form.Item
                                name="old_password"
                                label="Current Password"
                                rules={[{ required: true, message: 'Please enter current password' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="new_password"
                                label="New Password"
                                rules={[
                                    { required: true, message: 'Please enter new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="confirm_password"
                                label="Confirm New Password"
                                dependencies={['new_password']}
                                rules={[
                                    { required: true, message: 'Please confirm password' },
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
                                <Input.Password />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={changingPassword}
                            >
                                Change Password
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Account Info */}
                    <Card title="Account Information">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                            <Descriptions.Item label="Role">
                                {user?.is_superuser ? (
                                    <Tag color="red">Super Admin</Tag>
                                ) : user?.firm?.role ? (
                                    <Tag color={getRoleColor(user.firm.role)}>
                                        {user.firm.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Tag>
                                ) : (
                                    <Tag>No Role</Tag>
                                )}
                            </Descriptions.Item>
                            {user?.firm && (
                                <Descriptions.Item label="Firm">{user.firm.name}</Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SettingsPage;
