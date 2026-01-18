/**
 * Tasks page.
 */

import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Typography,
    Row,
    Col,
    Card,
    Dropdown,
    Modal,
    Form,
    DatePicker,
    Checkbox,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    CheckOutlined,
    DeleteOutlined,
    MoreOutlined,
    EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTasks, useMyTasks, useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask, useCaseAssignments } from '../../hooks';
import { useCases } from '../../hooks/useCases';

const { Title, Text } = Typography;

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const TasksPage = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [showMyTasks, setShowMyTasks] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [form] = Form.useForm();

    const { data: allTasks, isLoading: allLoading, refetch: refetchAll } = useTasks({
        search,
        status: status || undefined,
        priority: priority || undefined,
    });
    const { data: myTasks, isLoading: myLoading, refetch: refetchMy } = useMyTasks({
        status: status || undefined,
        priority: priority || undefined,
    });

    const { data: cases } = useCases();
    const { data: caseAssignments } = useCaseAssignments(selectedCaseId);
    const { mutate: createTask, isPending: creating } = useCreateTask();
    const { mutate: updateTask, isPending: updating } = useUpdateTask();
    const { mutate: deleteTask } = useDeleteTask();
    const { mutate: completeTask } = useCompleteTask();

    const data = showMyTasks ? myTasks : allTasks;
    const isLoading = showMyTasks ? myLoading : allLoading;
    const refetch = showMyTasks ? refetchMy : refetchAll;

    // Build assignee options from case assignments
    const assigneeOptions = (caseAssignments?.results || caseAssignments || []).map((a) => ({
        value: a.user?.id,
        label: `${a.user?.full_name} (${a.role_display})`,
    }));

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Task',
            content: 'Are you sure you want to delete this task?',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteTask(id, { onSuccess: () => refetch() }),
        });
    };

    const handleComplete = (id) => {
        completeTask(id, { onSuccess: () => refetch() });
    };

    const handleSubmit = (values) => {
        const taskData = {
            ...values,
            due_date: values.due_date?.toISOString(),
        };

        if (editingTask) {
            updateTask(
                { id: editingTask.id, data: taskData },
                {
                    onSuccess: () => {
                        setModalOpen(false);
                        setEditingTask(null);
                        setSelectedCaseId(null);
                        form.resetFields();
                        refetch();
                    },
                }
            );
        } else {
            createTask(taskData, {
                onSuccess: () => {
                    setModalOpen(false);
                    setSelectedCaseId(null);
                    form.resetFields();
                    refetch();
                },
            });
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setSelectedCaseId(task.case);
        form.setFieldsValue({
            ...task,
            case_id: task.case,
            assigned_to_id: task.assigned_to?.id,
            due_date: task.due_date ? dayjs(task.due_date) : null,
        });
        setModalOpen(true);
    };

    const handleCaseChange = (caseId) => {
        setSelectedCaseId(caseId);
        // Clear assigned_to when case changes
        form.setFieldValue('assigned_to_id', null);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'gold',
            in_progress: 'blue',
            completed: 'green',
            cancelled: 'default',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = { low: 'default', medium: 'blue', high: 'orange', urgent: 'red' };
        return colors[priority] || 'default';
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <Text strong style={{ textDecoration: record.status === 'completed' ? 'line-through' : 'none' }}>
                        {text}
                    </Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.case_number}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status_display',
            key: 'status',
            width: 110,
            render: (text, record) => <Tag color={getStatusColor(record.status)}>{text}</Tag>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority_display',
            key: 'priority',
            width: 90,
            render: (text, record) => <Tag color={getPriorityColor(record.priority)}>{text}</Tag>,
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to_name',
            key: 'assigned_to',
            width: 130,
            ellipsis: true,
            render: (text) => text || 'Unassigned',
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            width: 110,
            render: (date, record) => {
                if (!date) return '-';
                const d = dayjs(date);
                const isOverdue = record.is_overdue;
                return (
                    <Text type={isOverdue ? 'danger' : undefined}>
                        {d.format('MMM DD, YYYY')}
                    </Text>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            ...(record.status !== 'completed' ? [{
                                key: 'complete',
                                icon: <CheckOutlined />,
                                label: 'Mark Complete',
                                onClick: () => handleComplete(record.id),
                            }] : []),
                            {
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: 'Edit',
                                onClick: () => openEditModal(record),
                            },
                            { type: 'divider' },
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => handleDelete(record.id),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Tasks</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingTask(null);
                            setSelectedCaseId(null);
                            form.resetFields();
                            setModalOpen(true);
                        }}
                    >
                        New Task
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={10} md={8}>
                        <Input
                            placeholder="Search tasks..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            value={status}
                            onChange={setStatus}
                            options={statusOptions}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            value={priority}
                            onChange={setPriority}
                            options={priorityOptions}
                        />
                    </Col>
                    <Col>
                        <Checkbox
                            checked={showMyTasks}
                            onChange={(e) => setShowMyTasks(e.target.checked)}
                        >
                            My Tasks Only
                        </Checkbox>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={data?.results || data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: data?.count,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} tasks`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Task Modal */}
            <Modal
                title={editingTask ? 'Edit Task' : 'New Task'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                    setSelectedCaseId(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={creating || updating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ priority: 'medium' }}
                >
                    <Form.Item
                        name="case_id"
                        label="Case"
                        rules={[{ required: true, message: 'Please select a case' }]}
                    >
                        <Select
                            placeholder="Select case"
                            showSearch
                            optionFilterProp="label"
                            disabled={!!editingTask}
                            onChange={handleCaseChange}
                            options={(cases?.results || cases || []).map((c) => ({
                                value: c.id,
                                label: `${c.case_number} - ${c.title}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter task title' }]}
                    >
                        <Input placeholder="Task title" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Task description (optional)" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="priority" label="Priority">
                                <Select options={priorityOptions.slice(1)} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="due_date" label="Due Date">
                                <DatePicker style={{ width: '100%' }} showTime />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="assigned_to_id"
                        label="Assign To"
                    >
                        <Select
                            placeholder={selectedCaseId ? "Select team member" : "Select a case first"}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={assigneeOptions}
                            disabled={!selectedCaseId}
                        />
                    </Form.Item>

                    {editingTask && (
                        <Form.Item name="status" label="Status">
                            <Select options={statusOptions.slice(1)} />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default TasksPage;
