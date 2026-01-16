/**
 * Cases list page.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Dropdown,
    Modal,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCases, useDeleteCase, useCaseTypes } from '../../hooks';

const { Title } = Typography;

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'closed_won', label: 'Closed - Won' },
    { value: 'closed_lost', label: 'Closed - Lost' },
    { value: 'closed_settled', label: 'Closed - Settled' },
];

const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const CasesPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');

    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    const { data, isLoading, refetch } = useCases({
        search,
        status: status || undefined,
        priority: priority || undefined,
    });
    const { mutate: deleteCase } = useDeleteCase();
    const { data: caseTypes } = useCaseTypes();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Case',
            content: 'Are you sure you want to delete this case? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => {
                deleteCase(id, {
                    onSuccess: () => refetch(),
                });
            },
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'blue',
            in_progress: 'orange',
            pending: 'gold',
            on_hold: 'default',
            closed_won: 'green',
            closed_lost: 'red',
            closed_settled: 'cyan',
            withdrawn: 'default',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'default',
            medium: 'blue',
            high: 'orange',
            urgent: 'red',
        };
        return colors[priority] || 'default';
    };

    const columns = [
        {
            title: 'Case Number',
            dataIndex: 'case_number',
            key: 'case_number',
            width: 140,
            render: (text, record) => (
                <a onClick={() => navigate(`/cases/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Client',
            dataIndex: 'client_name',
            key: 'client_name',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Type',
            dataIndex: 'case_type_name',
            key: 'case_type_name',
            width: 130,
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status_display',
            key: 'status',
            width: 120,
            render: (text, record) => (
                <Tag color={getStatusColor(record.status)}>{text}</Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority_display',
            key: 'priority',
            width: 100,
            render: (text, record) => (
                <Tag color={getPriorityColor(record.priority)}>{text}</Tag>
            ),
        },
        {
            title: 'Next Hearing',
            dataIndex: 'next_hearing',
            key: 'next_hearing',
            width: 120,
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                icon: <EyeOutlined />,
                                label: 'View',
                                onClick: () => navigate(`/cases/${record.id}`),
                            },
                            {
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: 'Edit',
                                onClick: () => navigate(`/cases/${record.id}/edit`),
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
                    <Title level={3} style={{ margin: 0 }}>Cases</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/cases/new')}
                    >
                        New Case
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search cases..."
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
                            onChange={(value) => {
                                const params = new URLSearchParams(searchParams);
                                if (value) {
                                    params.set('status', value);
                                } else {
                                    params.delete('status');
                                }
                                setSearchParams(params);
                            }}
                            options={statusOptions}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            value={priority}
                            onChange={(value) => {
                                const params = new URLSearchParams(searchParams);
                                if (value) {
                                    params.set('priority', value);
                                } else {
                                    params.delete('priority');
                                }
                                setSearchParams(params);
                            }}
                            options={priorityOptions}
                        />
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
                        showTotal: (total) => `Total ${total} cases`,
                    }}
                    scroll={{ x: 900 }}
                />
            </Card>
        </div>
    );
};

export default CasesPage;
