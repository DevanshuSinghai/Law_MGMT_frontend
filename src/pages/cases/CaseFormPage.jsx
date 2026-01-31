/**
 * Case form page for creating/editing cases.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Spin,
    Divider,
    message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCase, useCreateCase, useUpdateCase, useCaseTypes, useCaseAssignments } from '../../hooks';
import { useAllClients } from '../../hooks/useClients';
import { firmsApi, casesApi } from '../../api';
import { useAuthStore } from '../../stores';

const { Title } = Typography;
const { TextArea } = Input;

const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'closed_won', label: 'Closed - Won' },
    { value: 'closed_lost', label: 'Closed - Lost' },
    { value: 'closed_settled', label: 'Closed - Settled' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const roleOptions = [
    { value: 'lead', label: 'Lead Counsel' },
    { value: 'associate', label: 'Associate' },
    { value: 'paralegal', label: 'Paralegal' },
    { value: 'support', label: 'Support' },
];

const CaseFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const isEditing = !!id;
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const firmId = user?.firm?.id;

    const { data: caseData, isLoading: caseLoading } = useCase(id);
    const { data: caseTypes } = useCaseTypes();
    const { data: clients } = useAllClients();
    const { data: caseAssignments, refetch: refetchAssignments } = useCaseAssignments(id);
    const { mutate: createCase, isPending: creating } = useCreateCase();
    const { mutate: updateCase, isPending: updating } = useUpdateCase();

    // Fetch firm members for assignment dropdown
    const { data: firmMembers } = useQuery({
        queryKey: ['firm-members', firmId],
        queryFn: () => firmsApi.getMembers(firmId),
        enabled: !!firmId,
    });

    // Add assignment mutation
    const addAssignment = useMutation({
        mutationFn: ({ caseId, data }) => casesApi.addAssignment(caseId, data),
        onSuccess: () => {
            message.success('Team member assigned');
            refetchAssignments();
            queryClient.invalidateQueries({ queryKey: ['case-assignments'] });
        },
        onError: (error) => {
            message.error(error.response?.data?.detail || 'Failed to assign member');
        },
    });

    // Remove assignment mutation
    const removeAssignment = useMutation({
        mutationFn: ({ caseId, assignmentId }) => casesApi.removeAssignment(caseId, assignmentId),
        onSuccess: () => {
            message.success('Team member removed');
            refetchAssignments();
            queryClient.invalidateQueries({ queryKey: ['case-assignments'] });
        },
    });

    // Get list of already assigned user IDs
    const assignedUserIds = (caseAssignments?.results || caseAssignments || []).map(a => a.user?.id);

    // Available members (not yet assigned)
    const availableMembers = (firmMembers?.results || firmMembers || []).filter(
        m => !assignedUserIds.includes(m.user?.id)
    );

    useEffect(() => {
        if (caseData && isEditing) {
            form.setFieldsValue({
                ...caseData,
                client_id: caseData.client?.id,
                case_type_id: caseData.case_type?.id,
                filing_date: caseData.filing_date ? dayjs(caseData.filing_date) : null,
                next_hearing: caseData.next_hearing ? dayjs(caseData.next_hearing) : null,
            });
        }
    }, [caseData, isEditing, form]);

    const onFinish = (values) => {
        const data = {
            ...values,
            filing_date: values.filing_date?.format('YYYY-MM-DD'),
            next_hearing: values.next_hearing?.format('YYYY-MM-DD'),
        };

        // Remove team_members from data as it's handled separately
        delete data.team_members;

        if (isEditing) {
            updateCase(
                { id, data },
                {
                    onSuccess: () => navigate(`/cases/${id}`),
                }
            );
        } else {
            createCase(data, {
                onSuccess: (newCase) => {
                    // If team members were selected, assign them
                    const teamMembers = form.getFieldValue('team_members') || [];
                    if (teamMembers.length > 0 && newCase.id) {
                        teamMembers.forEach(member => {
                            addAssignment.mutate({
                                caseId: newCase.id,
                                data: { user_id: member.user_id, role: member.role },
                            });
                        });
                    }
                    navigate(`/cases/${newCase.id}`);
                },
            });
        }
    };

    const handleAddMember = (values) => {
        if (!id) {
            message.info('Save the case first, then you can add team members');
            return;
        }
        addAssignment.mutate({
            caseId: id,
            data: { user_id: values.user_id, role: values.role || 'associate' },
        });
    };

    if (isEditing && caseLoading) {
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
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Col>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        {isEditing ? 'Edit Case' : 'New Case'}
                    </Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={creating || updating}
                        onClick={() => form.submit()}
                    >
                        {isEditing ? 'Update' : 'Create'} Case
                    </Button>
                </Col>
            </Row>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    status: 'open',
                    priority: 'medium',
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card title="Basic Information">
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="case_number"
                                        label="Case Number"
                                        rules={[{ required: true, message: 'Please enter case number' }]}
                                    >
                                        <Input placeholder="e.g., CASE-2026-001" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={16}>
                                    <Form.Item
                                        name="title"
                                        label="Title"
                                        rules={[{ required: true, message: 'Please enter case title' }]}
                                    >
                                        <Input placeholder="Case title" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="client_id" label="Client">
                                        <Select
                                            placeholder="Select client"
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            options={(clients?.results || clients || []).map((c) => ({
                                                value: c.id,
                                                label: c.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="case_type_id" label="Case Type">
                                        <Select
                                            placeholder="Select case type"
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            options={(caseTypes?.results || caseTypes || []).map((t) => ({
                                                value: t.id,
                                                label: t.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="description" label="Description">
                                <TextArea rows={4} placeholder="Case description..." />
                            </Form.Item>
                        </Card>

                        <Card title="Court Information" style={{ marginTop: 16 }}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="court_name" label="Court Name">
                                        <Input placeholder="e.g., District Court" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="court_location" label="Court Location">
                                        <Input placeholder="City, State" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="judge_name" label="Judge Name">
                                        <Input placeholder="Honorable..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Opposing Party" style={{ marginTop: 16 }}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="opposing_party" label="Opposing Party">
                                        <Input placeholder="Name of opposing party" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="opposing_counsel" label="Opposing Counsel">
                                        <Input placeholder="Name of opposing counsel" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Status & Dates">
                            <Form.Item name="status" label="Status">
                                <Select options={statusOptions} />
                            </Form.Item>

                            <Form.Item name="priority" label="Priority">
                                <Select options={priorityOptions} />
                            </Form.Item>

                            <Divider />

                            <Form.Item name="filing_date" label="Filing Date">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item name="next_hearing" label="Next Hearing Date">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Card>

                        {/* Team Assignment Card */}
                        <Card
                            title={<><TeamOutlined /> Team Assignment</>}
                            style={{ marginTop: 16 }}
                        >
                            {isEditing ? (
                                <>
                                    {/* Current assignments */}
                                    <div style={{ marginBottom: 16 }}>
                                        <strong>Assigned Members:</strong>
                                        {(caseAssignments?.results || caseAssignments || []).length > 0 ? (
                                            <div style={{ marginTop: 8 }}>
                                                {(caseAssignments?.results || caseAssignments || []).map((a) => (
                                                    <div
                                                        key={a.id}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '8px 0',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}
                                                    >
                                                        <div>
                                                            <div>{a.user?.full_name}</div>
                                                            <small style={{ color: '#888' }}>{a.role_display}</small>
                                                        </div>
                                                        <Button
                                                            type="link"
                                                            danger
                                                            size="small"
                                                            onClick={() => removeAssignment.mutate({ caseId: id, assignmentId: a.id })}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ color: '#888', marginTop: 8 }}>No members assigned</div>
                                        )}
                                    </div>

                                    <Divider />

                                    {/* Add new member */}
                                    <div>
                                        <strong>Add Member:</strong>
                                        <Select
                                            style={{ width: '100%', marginTop: 8 }}
                                            placeholder="Select team member"
                                            showSearch
                                            optionFilterProp="label"
                                            onChange={(userId) => {
                                                if (userId) {
                                                    handleAddMember({ user_id: userId, role: 'associate' });
                                                }
                                            }}
                                            value={null}
                                            options={availableMembers.map((m) => ({
                                                value: m.user?.id,
                                                label: `${m.user?.full_name} (${m.role_display})`,
                                            }))}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: '#888' }}>
                                    Save the case first to assign team members.
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default CaseFormPage;
