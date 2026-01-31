/**
 * Clients list page.
 */

import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';

    const { data, isLoading, refetch } = useClients({
        search,
        page,
        page_size: pageSize,
    });

    const handleTabChange = useCallback((pagination) => {
        setSearchParams({
            page: pagination.current.toString(),
            pageSize: pagination.pageSize.toString(),
            ...(search && { search }),
        });
    }, [search, setSearchParams]);

    const handleSearch = useCallback((value) => {
        setSearchParams({
            page: '1',
            pageSize: pageSize.toString(),
            ...(value && { search: value }),
        })
    }, [pageSize, setSearchParams]);

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
                    defaultValue={search}
                    onPressEnter={(e) => handleSearch(e.target.value)}
                    onBlur={(e) => handleSearch(e.target.value)}
                    onChange={(e) => {
                        if (!e.target.value) handleSearch('');
                    }}
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
                        current: page,
                        pageSize: pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTabChange}
                    scroll={{ x: 700 }}
                />
            </Card>
        </div>
    );
};

export default ClientsPage;
