/**
 * Clients list page.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Button,
    Input,
    Tag,
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
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    PhoneOutlined,
    MailOutlined,
} from '@ant-design/icons';
import { useClients, useDeleteClient } from '../../hooks';

const { Title, Text } = Typography;

const ClientsPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const { data, isLoading, refetch } = useClients({ search });
    const { mutate: deleteClient } = useDeleteClient();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Client',
            content: 'Are you sure you want to delete this client?',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => {
                deleteClient(id, {
                    onSuccess: () => refetch(),
                });
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    {record.company_name && (
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.company_name}</Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'client_type_display',
            key: 'client_type',
            width: 100,
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: 'Contact',
            key: 'contact',
            width: 250,
            render: (_, record) => (
                <div>
                    {record.email && (
                        <div><MailOutlined style={{ marginRight: 8 }} />{record.email}</div>
                    )}
                    {record.phone && (
                        <div><PhoneOutlined style={{ marginRight: 8 }} />{record.phone}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
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
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: 'Edit',
                                onClick: () => navigate(`/clients/${record.id}/edit`),
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
                    <Title level={3} style={{ margin: 0 }}>Clients</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/clients/new')}
                    >
                        New Client
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search clients..."
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
                    dataSource={data?.results || data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: data?.count,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} clients`,
                    }}
                />
            </Card>
        </div>
    );
};

export default ClientsPage;
