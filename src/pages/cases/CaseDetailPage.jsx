/**
 * Case detail page.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Descriptions,
    Tag,
    Button,
    Tabs,
    Typography,
    Spin,
    Space,
    Empty,
    List,
    Input,
    Avatar,
    Divider,
} from 'antd';
import {
    EditOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    CheckSquareOutlined,
    TeamOutlined,
    MessageOutlined,
    SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCase, useCaseNotes, useAddCaseNote, useCaseAssignments } from '../../hooks';
import { useDocuments } from '../../hooks/useDocuments';
import { useTasks } from '../../hooks/useTasks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CaseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [noteContent, setNoteContent] = useState('');

    const { data: caseData, isLoading } = useCase(id);
    const { data: notes, isLoading: notesLoading } = useCaseNotes(id);
    const { data: assignments } = useCaseAssignments(id);
    const { data: documents } = useDocuments({ case: id });
    const { data: tasks } = useTasks({ case: id });
    const { mutate: addNote, isPending: addingNote } = useAddCaseNote();

    const handleAddNote = () => {
        if (!noteContent.trim()) return;
        addNote(
            { caseId: id, data: { content: noteContent } },
            {
                onSuccess: () => setNoteContent(''),
            }
        );
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
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = { low: 'default', medium: 'blue', high: 'orange', urgent: 'red' };
        return colors[priority] || 'default';
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!caseData) {
        return <Empty description="Case not found" />;
    }

    const tabItems = [
        {
            key: 'overview',
            label: 'Overview',
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card title="Case Details" size="small">
                            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                <Descriptions.Item label="Case Number">{caseData.case_number}</Descriptions.Item>
                                <Descriptions.Item label="Client">{caseData.client?.name || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Type">{caseData.case_type?.name || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={getStatusColor(caseData.status)}>{caseData.status_display}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Priority">
                                    <Tag color={getPriorityColor(caseData.priority)}>{caseData.priority_display}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Filing Date">
                                    {caseData.filing_date ? dayjs(caseData.filing_date).format('MMM DD, YYYY') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Next Hearing">
                                    {caseData.next_hearing ? dayjs(caseData.next_hearing).format('MMM DD, YYYY') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Created">
                                    {dayjs(caseData.created_at).format('MMM DD, YYYY')}
                                </Descriptions.Item>
                            </Descriptions>

                            {caseData.description && (
                                <>
                                    <Divider />
                                    <Paragraph style={{ margin: 0 }}>
                                        <Text strong>Description:</Text>
                                        <br />
                                        {caseData.description}
                                    </Paragraph>
                                </>
                            )}
                        </Card>

                        {(caseData.court_name || caseData.opposing_party) && (
                            <Card title="Court Information" size="small" style={{ marginTop: 16 }}>
                                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                    <Descriptions.Item label="Court">{caseData.court_name || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Location">{caseData.court_location || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Judge">{caseData.judge_name || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Opposing Party">{caseData.opposing_party || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Opposing Counsel">{caseData.opposing_counsel || '-'}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Quick Stats" size="small">
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text><FileTextOutlined /> Documents</Text>
                                    <Text strong>{caseData.document_count || 0}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text><CheckSquareOutlined /> Tasks</Text>
                                    <Text strong>{caseData.task_count || 0}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text><CheckSquareOutlined /> Pending Tasks</Text>
                                    <Text strong type="warning">{caseData.pending_task_count || 0}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text><TeamOutlined /> Team Members</Text>
                                    <Text strong>{assignments?.length || 0}</Text>
                                </div>
                            </Space>
                        </Card>

                        <Card title="Team" size="small" style={{ marginTop: 16 }}>
                            {assignments?.length > 0 ? (
                                <List
                                    size="small"
                                    dataSource={assignments}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar size="small">{item.user?.first_name?.[0]}</Avatar>}
                                                title={item.user?.full_name}
                                                description={item.role_display}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="No team members" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'notes',
            label: (
                <span>
                    <MessageOutlined /> Notes
                </span>
            ),
            children: (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <TextArea
                            rows={3}
                            placeholder="Add a note..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleAddNote}
                            loading={addingNote}
                            style={{ marginTop: 8 }}
                        >
                            Add Note
                        </Button>
                    </div>
                    <Spin spinning={notesLoading}>
                        {notes?.length > 0 ? (
                            <List
                                dataSource={notes}
                                renderItem={(note) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar>{note.created_by?.first_name?.[0]}</Avatar>}
                                            title={
                                                <Space>
                                                    <Text strong>{note.created_by?.full_name}</Text>
                                                    <Text type="secondary">{dayjs(note.created_at).fromNow()}</Text>
                                                    {note.is_private && <Tag color="red">Private</Tag>}
                                                </Space>
                                            }
                                            description={note.content}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No notes yet" />
                        )}
                    </Spin>
                </div>
            ),
        },
        {
            key: 'documents',
            label: (
                <span>
                    <FileTextOutlined /> Documents ({documents?.results?.length || documents?.length || 0})
                </span>
            ),
            children: (
                <div>
                    {documents?.results?.length > 0 || documents?.length > 0 ? (
                        <List
                            dataSource={documents?.results || documents || []}
                            renderItem={(doc) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                                        title={doc.title}
                                        description={`${doc.file_name} • v${doc.current_version} • ${doc.file_size_display}`}
                                    />
                                    <Button type="link" onClick={() => navigate('/documents')}>
                                        View
                                    </Button>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No documents" />
                    )}
                </div>
            ),
        },
        {
            key: 'tasks',
            label: (
                <span>
                    <CheckSquareOutlined /> Tasks ({tasks?.results?.length || tasks?.length || 0})
                </span>
            ),
            children: (
                <div>
                    {tasks?.results?.length > 0 || tasks?.length > 0 ? (
                        <List
                            dataSource={tasks?.results || tasks || []}
                            renderItem={(task) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                {task.title}
                                                <Tag color={task.status === 'completed' ? 'green' : 'blue'}>
                                                    {task.status_display}
                                                </Tag>
                                            </Space>
                                        }
                                        description={`Assigned to: ${task.assigned_to_name || 'Unassigned'} • Due: ${task.due_date ? dayjs(task.due_date).format('MMM DD') : 'No due date'
                                            }`}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No tasks" />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cases')}>
                            Back
                        </Button>
                        <Title level={3} style={{ margin: 0 }}>
                            {caseData.case_number} - {caseData.title}
                        </Title>
                    </Space>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/cases/${id}/edit`)}
                    >
                        Edit Case
                    </Button>
                </Col>
            </Row>

            <Tabs defaultActiveKey="overview" items={tabItems} />
        </div>
    );
};

export default CaseDetailPage;
