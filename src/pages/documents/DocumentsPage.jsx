/**
 * Documents page.
 */

import { useState } from 'react';
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
    Upload,
    Form,
    message,
} from 'antd';
import {
    UploadOutlined,
    SearchOutlined,
    DownloadOutlined,
    DeleteOutlined,
    MoreOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDocuments, useUploadDocument, useDeleteDocument, downloadDocument } from '../../hooks';
import { useCases } from '../../hooks/useCases';

const { Title, Text } = Typography;

const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'pleading', label: 'Pleading' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'contract', label: 'Contract' },
    { value: 'court_order', label: 'Court Order' },
    { value: 'affidavit', label: 'Affidavit' },
    { value: 'notice', label: 'Notice' },
    { value: 'motion', label: 'Motion' },
    { value: 'brief', label: 'Brief' },
    { value: 'other', label: 'Other' },
];

const DocumentsPage = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadForm] = Form.useForm();

    const { data, isLoading, refetch } = useDocuments({
        search,
        category: category || undefined,
    });
    const { data: cases } = useCases();
    const { mutate: uploadDocument, isPending: uploading } = useUploadDocument();
    const { mutate: deleteDocument } = useDeleteDocument();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Document',
            content: 'Are you sure you want to delete this document?',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteDocument(id, { onSuccess: () => refetch() }),
        });
    };

    const handleUpload = (values) => {
        const file = values.file?.fileList?.[0]?.originFileObj;
        if (!file) {
            message.error('Please select a file');
            return;
        }

        uploadDocument(
            {
                caseId: values.case_id,
                file,
                title: values.title,
                category: values.category || 'other',
                description: values.description || '',
                tags: values.tags || '',
            },
            {
                onSuccess: () => {
                    setUploadModalOpen(false);
                    uploadForm.resetFields();
                    refetch();
                },
            }
        );
    };

    const getFileIcon = (doc) => {
        if (doc.is_pdf) return <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />;
        if (doc.is_image) return <FileImageOutlined style={{ fontSize: 20, color: '#1677ff' }} />;
        return <FileTextOutlined style={{ fontSize: 20, color: '#52c41a' }} />;
    };

    const columns = [
        {
            title: 'Document',
            key: 'document',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getFileIcon(record)}
                    <div>
                        <Text strong>{record.title}</Text>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.file_name} • {record.file_size_display}
                            </Text>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category_display',
            key: 'category',
            width: 120,
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: 'Version',
            dataIndex: 'current_version',
            key: 'version',
            width: 80,
            render: (v) => `v${v}`,
        },
        {
            title: 'Uploaded By',
            dataIndex: 'uploaded_by_name',
            key: 'uploaded_by',
            width: 130,
            ellipsis: true,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 100,
            render: (date) => dayjs(date).format('MMM DD, YYYY'),
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
                                key: 'download',
                                icon: <DownloadOutlined />,
                                label: 'Download',
                                onClick: () => downloadDocument(record.id, record.file_name),
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
                    <Title level={3} style={{ margin: 0 }}>Documents</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setUploadModalOpen(true)}
                    >
                        Upload Document
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search documents..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            value={category}
                            onChange={setCategory}
                            options={categoryOptions}
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
                        showTotal: (total) => `Total ${total} documents`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Upload Modal */}
            <Modal
                title="Upload Document"
                open={uploadModalOpen}
                onCancel={() => {
                    setUploadModalOpen(false);
                    uploadForm.resetFields();
                }}
                onOk={() => uploadForm.submit()}
                confirmLoading={uploading}
            >
                <Form
                    form={uploadForm}
                    layout="vertical"
                    onFinish={handleUpload}
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
                            options={(cases?.results || cases || []).map((c) => ({
                                value: c.id,
                                label: `${c.case_number} - ${c.title}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Document Title"
                        rules={[{ required: true, message: 'Please enter document title' }]}
                    >
                        <Input placeholder="Document title" />
                    </Form.Item>

                    <Form.Item name="category" label="Category">
                        <Select
                            placeholder="Select category"
                            options={categoryOptions.slice(1)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="File"
                        rules={[{ required: true, message: 'Please select a file' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} placeholder="Document description (optional)" />
                    </Form.Item>

                    <Form.Item name="tags" label="Tags">
                        <Input placeholder="Comma-separated tags (optional)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DocumentsPage;
