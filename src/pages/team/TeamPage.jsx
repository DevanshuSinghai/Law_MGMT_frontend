/**
 * Team management page (for managers only).
 */

import { useState } from 'react';
import {
    Table,
    Button,
    Input,
    Tag,
    Typography,
    Row,
    Col,
    Card,
    Modal,
    Form,
    Select,
    Switch,
    message,
    Avatar,
    Space,
    Spin,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firmsApi } from '../../api';
import { useAuthStore } from '../../stores';

const { Title, Text } = Typography;

const roleOptions = [
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'paralegal', label: 'Paralegal' },
    { value: 'staff', label: 'Staff' },
];

const TeamPage = () => {
    const [search, setSearch] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const firmId = user?.firm?.id;

    // Fetch team members
    const { data: membersData, isLoading } = useQuery({
        queryKey: ['team-members', firmId],
        queryFn: () => firmsApi.getMembers(firmId),
        enabled: !!firmId,
    });

    // Extract members from response (handles both array and paginated response)
    const members = membersData?.results || membersData || [];

    // Add member mutation
    const addMember = useMutation({
        mutationFn: (data) => firmsApi.addMember(firmId, data),
        onSuccess: () => {
            message.success('Member added successfully');
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            setAddModalOpen(false);
            addForm.resetFields();
        },
        onError: (error) => {
            const errorData = error.response?.data;
            if (errorData) {
                const firstKey = Object.keys(errorData)[0];
                const firstError = errorData[firstKey];
                message.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                message.error('Failed to add member');
            }
        },
    });

    // Update member mutation
    const updateMember = useMutation({
        mutationFn: ({ userId, data }) => firmsApi.updateMember(firmId, userId, data),
        onSuccess: () => {
            message.success('Member updated');
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            setEditModalOpen(false);
            setEditingMember(null);
            editForm.resetFields();
        },
        onError: (error) => {
            message.error(error.response?.data?.detail || 'Failed to update member');
        },
    });

    // Toggle member status mutation
    const toggleStatus = useMutation({
        mutationFn: ({ userId, isActive }) => firmsApi.toggleMemberStatus(firmId, userId, isActive),
        onSuccess: () => {
            message.success('Status updated');
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });

    const openEditModal = (member) => {
        setEditingMember(member);
        editForm.setFieldsValue({
            role: member.role,
            can_assign_tasks: member.can_assign_tasks,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (values) => {
        updateMember.mutate({
            userId: editingMember.user.id,
            data: values,
        });
    };

    const handleAddSubmit = (values) => {
        addMember.mutate(values);
    };

    const getRoleColor = (role) => {
        const colors = {
            firm_manager: 'purple',
            lawyer: 'blue',
            paralegal: 'cyan',
            staff: 'default',
        };
        return colors[role] || 'default';
    };

    const filteredMembers = members.filter((m) =>
        m.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            title: 'Member',
            key: 'member',
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <Text strong>{record.user?.full_name}</Text>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email}</Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role_display',
            key: 'role',
            width: 130,
            render: (text, record) => <Tag color={getRoleColor(record.role)}>{text}</Tag>,
        },
        {
            title: 'Can Assign Tasks',
            dataIndex: 'can_assign_tasks',
            key: 'can_assign_tasks',
            width: 130,
            render: (value) => value ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
        },
        {
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, record) => (
                <Switch
                    checked={record.is_active}
                    onChange={(checked) => toggleStatus.mutate({
                        userId: record.user.id,
                        isActive: checked,
                    })}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record)}
                />
            ),
        },
    ];

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Team Members</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            addForm.resetFields();
                            setAddModalOpen(true);
                        }}
                    >
                        Add Member
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search members..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                    style={{ maxWidth: 400 }}
                />
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredMembers}
                    rowKey={(record) => record.user?.id}
                    pagination={{
                        showTotal: (total) => `Total ${total} members`,
                    }}
                />
            </Card>

            {/* Add Member Modal */}
            <Modal
                title="Add Team Member"
                open={addModalOpen}
                onCancel={() => {
                    setAddModalOpen(false);
                    addForm.resetFields();
                }}
                onOk={() => addForm.submit()}
                confirmLoading={addMember.isPending}
                width={500}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleAddSubmit}
                    initialValues={{ role: 'lawyer', can_assign_tasks: false }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="first_name"
                                label="First Name"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input placeholder="First name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="last_name"
                                label="Last Name"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input placeholder="Last name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Required' },
                            { type: 'email', message: 'Invalid email' },
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Required' },
                            { min: 8, message: 'Min 8 characters' },
                        ]}
                    >
                        <Input.Password placeholder="Temporary password" />
                    </Form.Item>

                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="Phone number (optional)" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                                <Select options={roleOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="can_assign_tasks"
                                label="Can Assign Tasks"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="designation" label="Designation">
                        <Input placeholder="e.g., Senior Associate (optional)" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Member Modal */}
            <Modal
                title="Edit Member"
                open={editModalOpen}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditingMember(null);
                    editForm.resetFields();
                }}
                onOk={() => editForm.submit()}
                confirmLoading={updateMember.isPending}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>{editingMember?.user?.full_name}</Text>
                        <br />
                        <Text type="secondary">{editingMember?.user?.email}</Text>
                    </div>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true }]}
                    >
                        <Select options={roleOptions} />
                    </Form.Item>

                    <Form.Item
                        name="can_assign_tasks"
                        label="Can Assign Tasks"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamPage;
