/**
 * Client form page.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Spin,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useClient, useCreateClient, useUpdateClient } from '../../hooks';

const { Title } = Typography;
const { TextArea } = Input;

const clientTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'Bank', label: 'Bank' },
    { value: 'organization', label: 'Organization' },
    { value: 'government', label: 'Government' },
];

const ClientFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const isEditing = !!id;

    const { data: client, isLoading } = useClient(id);
    const { mutate: createClient, isPending: creating } = useCreateClient();
    const { mutate: updateClient, isPending: updating } = useUpdateClient();

    useEffect(() => {
        if (client && isEditing) {
            form.setFieldsValue(client);
        }
    }, [client, isEditing, form]);

    const onFinish = (values) => {
        if (isEditing) {
            updateClient(
                { id, data: values },
                { onSuccess: () => navigate('/clients') }
            );
        } else {
            createClient(values, {
                onSuccess: () => navigate('/clients'),
            });
        }
    };

    if (isEditing && isLoading) {
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
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clients')}>
                        Back
                    </Button>
                </Col>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        {isEditing ? 'Edit Client' : 'New Client'}
                    </Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={creating || updating}
                        onClick={() => form.submit()}
                    >
                        {isEditing ? 'Update' : 'Create'} Client
                    </Button>
                </Col>
            </Row>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ client_type: 'individual' }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Card title="Basic Information">
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter client name' }]}
                            >
                                <Input placeholder="Full name" />
                            </Form.Item>

                            <Form.Item name="client_type" label="Client Type">
                                <Select options={clientTypeOptions} />
                            </Form.Item>

                            <Form.Item name="company_name" label="Company Name">
                                <Input placeholder="Company name (if applicable)" />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Contact Information">
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                            >
                                <Input placeholder="email@example.com" />
                            </Form.Item>

                            <Form.Item name="phone" label="Phone">
                                <Input placeholder="+1 234 567 8900" />
                            </Form.Item>

                            <Form.Item name="alternate_phone" label="Alternate Phone">
                                <Input placeholder="Alternate phone" />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Address">
                            <Form.Item name="address" label="Address">
                                <TextArea rows={3} placeholder="Full address" />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Identification">
                            <Form.Item name="id_type" label="ID Type">
                                <Input placeholder="e.g., Passport, Driver's License" />
                            </Form.Item>

                            <Form.Item name="id_number" label="ID Number">
                                <Input placeholder="ID number" />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24}>
                        <Card title="Notes">
                            <Form.Item name="notes" label="Notes">
                                <TextArea rows={4} placeholder="Additional notes about the client..." />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default ClientFormPage;
