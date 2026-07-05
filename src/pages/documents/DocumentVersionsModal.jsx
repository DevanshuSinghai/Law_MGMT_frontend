/**
 * Document version history modal.
 * Shows who changed the document, when, and their notes, with per-version
 * view/download, plus an inline "upload new version" form.
 */

import { useState } from 'react';
import {
    Modal,
    List,
    Button,
    Tag,
    Typography,
    Space,
    Tooltip,
    Divider,
    Upload,
    Input,
    Empty,
    Spin,
    message,
} from 'antd';
import {
    EyeOutlined,
    DownloadOutlined,
    UploadOutlined,
    UserOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useDocumentVersions,
    useUploadVersion,
    downloadDocumentVersion,
    viewDocumentVersion,
} from '../../hooks';

const { Text, Paragraph } = Typography;

const DocumentVersionsModal = ({ open, document: doc, onClose }) => {
    const docId = open ? doc?.id : null;
    const { data: versions, isLoading } = useDocumentVersions(docId);
    const { mutate: uploadVersion, isPending: uploading } = useUploadVersion();

    const [file, setFile] = useState(null);
    const [changeNotes, setChangeNotes] = useState('');

    const versionList = versions || [];

    const handleView = (version) => {
        // Open the tab synchronously so the popup blocker allows it
        const win = window.open('', '_blank');
        viewDocumentVersion(doc.id, version.id, win);
    };

    const handleDownload = (version) => {
        downloadDocumentVersion(doc.id, version.id, version.file_name || `v${version.version_number}`);
    };

    const handleUpload = () => {
        if (!file) {
            message.error('Please select a file');
            return;
        }
        uploadVersion(
            { id: doc.id, file, changeNotes },
            {
                onSuccess: () => {
                    setFile(null);
                    setChangeNotes('');
                },
            }
        );
    };

    return (
        <Modal
            title={`Version History — ${doc?.title || ''}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={640}
        >
            {/* Upload new version */}
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Text strong>Upload New Version</Text>
                <Space.Compact style={{ width: '100%' }}>
                    <Upload
                        beforeUpload={(f) => {
                            setFile(f);
                            return false;
                        }}
                        onRemove={() => setFile(null)}
                        maxCount={1}
                        fileList={file ? [file] : []}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    >
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </Space.Compact>
                <Input.TextArea
                    rows={2}
                    placeholder="What changed? (optional)"
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                />
                <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={uploading}
                    disabled={!file}
                >
                    Upload Version
                </Button>
            </Space>

            <Divider style={{ margin: '16px 0' }} />

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                    <Spin />
                </div>
            ) : versionList.length === 0 ? (
                <Empty description="No versions found" />
            ) : (
                <List
                    dataSource={versionList}
                    rowKey="id"
                    renderItem={(version, index) => (
                        <List.Item
                            actions={[
                                <Tooltip title="View" key="view">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleView(version)}
                                    />
                                </Tooltip>,
                                <Tooltip title="Download" key="download">
                                    <Button
                                        type="text"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownload(version)}
                                    />
                                </Tooltip>,
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>Version {version.version_number}</Text>
                                        {index === 0 && <Tag color="blue">Latest</Tag>}
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={2}>
                                        <Text type="secondary">
                                            <UserOutlined />{' '}
                                            {version.uploaded_by?.full_name ||
                                                version.uploaded_by?.email ||
                                                'Unknown'}
                                        </Text>
                                        <Text type="secondary">
                                            <ClockCircleOutlined />{' '}
                                            {dayjs(version.created_at).format('MMM DD, YYYY HH:mm')}
                                        </Text>
                                        {version.change_notes && (
                                            <Paragraph
                                                italic
                                                style={{ margin: 0 }}
                                                type="secondary"
                                            >
                                                "{version.change_notes}"
                                            </Paragraph>
                                        )}
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default DocumentVersionsModal;
