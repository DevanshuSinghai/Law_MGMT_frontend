/**
 * Generic Micro-Tools resource manager — table + create/edit modal + delete,
 * driven entirely by SECTIONS[section] config. Handles text/number/select/date/
 * switch/file/image fields and multipart uploads.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Table, Button, Input, Modal, Form, Select, DatePicker, InputNumber, Switch,
  Upload, Tag, Typography, Row, Col, Card, Space, message, Image,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, SearchOutlined,
  ArrowLeftOutlined, UploadOutlined, LinkOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import dayjs from 'dayjs';
import { SECTIONS } from './resourceConfigs';
import { toolsAdminApi } from '../../api/toolsAdmin';

const { Title, Text } = Typography;
const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

const ResourceManagerPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const cfg = SECTIONS[section];
  const qc = useQueryClient();
  const [form] = Form.useForm();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const queryKey = ['tools-admin', section, { page, pageSize, search }];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => toolsAdminApi.list(cfg.endpoint, { page, page_size: pageSize, ...(search && { search }) }),
    enabled: !!cfg,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tools-admin', section] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? toolsAdminApi.update(cfg.endpoint, editing.id, payload) : toolsAdminApi.create(cfg.endpoint, payload),
    onSuccess: () => {
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      invalidate();
    },
    onError: (err) => {
      const d = err?.response?.data;
      const msg = d ? (typeof d === 'string' ? d : Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(' · ')) : 'Save failed';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => toolsAdminApi.remove(cfg.endpoint, id),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  if (!cfg) {
    return (
      <div>
        <Text type="danger">Unknown section.</Text>
        <div><Button type="link" onClick={() => navigate('/tools-admin')}>Back to Micro-Tools</Button></div>
      </div>
    );
  }

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };

  const openEdit = (record) => {
    setEditing(record);
    const values = {};
    cfg.fields.forEach((f) => {
      if (f.type === 'file' || f.type === 'image') return; // shown as current preview, upload to replace
      if (f.type === 'date') values[f.name] = record[f.name] ? dayjs(record[f.name]) : null;
      else values[f.name] = record[f.name];
    });
    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    const payload = {};
    cfg.fields.forEach((f) => {
      const v = values[f.name];
      if (f.type === 'file' || f.type === 'image') {
        const file = v && v[0] && v[0].originFileObj;
        if (file) payload[f.name] = file;
        return;
      }
      if (f.type === 'date') { if (v) payload[f.name] = v.format('YYYY-MM-DD'); return; }
      if (f.type === 'switch') { payload[f.name] = !!v; return; }
      if (v !== undefined && v !== null) payload[f.name] = v;
    });
    saveMutation.mutate(payload);
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: `Delete "${record[cfg.fields[0].name] || 'item'}"?`,
      okText: 'Delete', okType: 'danger',
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  // -- Table columns from list:true fields --
  const listFields = cfg.fields.filter((f) => f.list);
  const columns = listFields.map((f) => ({
    title: f.label,
    dataIndex: f.name,
    key: f.name,
    width: f.width,
    render: (val, record) => {
      if (f.type === 'switch') return <Tag color={val ? 'green' : 'default'}>{val ? 'Active' : 'Hidden'}</Tag>;
      if (f.type === 'date') return val ? dayjs(val).format('DD MMM YYYY') : <Text type="secondary">—</Text>;
      if (f.type === 'select') return f.options?.find((o) => o.value === val)?.label || val || <Text type="secondary">—</Text>;
      if (f.type === 'file') return record[f.name]
        ? <a href={record[f.name]} target="_blank" rel="noreferrer"><LinkOutlined /> View</a>
        : <Text type="secondary">—</Text>;
      return val || <Text type="secondary">—</Text>;
    },
  }));
  columns.push({
    title: '', key: 'actions', width: 56, fixed: 'right',
    onCell: () => ({ onClick: (e) => e.stopPropagation() }),
    render: (_, record) => (
      <Dropdown trigger={['click']} menu={{ items: [
        { key: 'edit', icon: <EditOutlined />, label: 'Edit', onClick: () => openEdit(record) },
        { type: 'divider' },
        { key: 'del', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => confirmDelete(record) },
      ] }}>
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    ),
  });

  const rows = data?.results || data || [];

  const renderField = (f) => {
    const rules = f.required ? [{ required: true, message: `${f.label} is required` }] : [];
    if (f.type === 'file' || f.type === 'image') {
      const current = editing && editing[f.name];
      return (
        <Form.Item key={f.name} label={f.label} required={f.required}>
          {current ? (
            <div style={{ marginBottom: 8 }}>
              {f.type === 'image'
                ? <Image src={current} width={80} style={{ borderRadius: 8 }} />
                : <a href={current} target="_blank" rel="noreferrer"><LinkOutlined /> Current file</a>}
              <div><Text type="secondary" style={{ fontSize: 12 }}>Upload to replace</Text></div>
            </div>
          ) : null}
          <Form.Item name={f.name} valuePropName="fileList" getValueFromEvent={normFile} noStyle
            rules={!editing ? rules : []}>
            <Upload beforeUpload={() => false} maxCount={1}
              listType={f.type === 'image' ? 'picture' : 'text'}
              accept={f.type === 'image' ? 'image/*' : undefined}>
              <Button icon={<UploadOutlined />}>Select {f.type === 'image' ? 'image' : 'file'}</Button>
            </Upload>
          </Form.Item>
        </Form.Item>
      );
    }

    let control;
    if (f.type === 'textarea') control = <Input.TextArea rows={f.rows || 3} placeholder={f.placeholder} />;
    else if (f.type === 'number') control = <InputNumber style={{ width: '100%' }} />;
    else if (f.type === 'select') control = <Select options={f.options} placeholder={f.placeholder} />;
    else if (f.type === 'date') control = <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />;
    else if (f.type === 'switch') return (
      <Form.Item key={f.name} name={f.name} label={f.label} valuePropName="checked" initialValue={f.default}>
        <Switch />
      </Form.Item>
    );
    else control = <Input placeholder={f.placeholder} />;

    return (
      <Form.Item key={f.name} name={f.name} label={f.label} rules={rules} initialValue={f.default}>
        {control}
      </Form.Item>
    );
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tools-admin')} />
            <Title level={3} style={{ margin: 0 }}>{cfg.title}</Title>
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder={`Search ${cfg.title.toLowerCase()}...`}
          prefix={<SearchOutlined />}
          allowClear
          style={{ maxWidth: 400 }}
          onPressEnter={(e) => { setPage(1); setSearch(e.target.value); }}
          onChange={(e) => { if (!e.target.value) { setPage(1); setSearch(''); } }}
        />
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={isLoading}
          onRow={(record) => ({ onClick: () => openEdit(record), style: { cursor: 'pointer' } })}
          pagination={{
            current: page, pageSize,
            total: data?.count ?? rows.length,
            showSizeChanger: true, pageSizeOptions: ['20', '50', '100'],
            showTotal: (t) => `Total ${t}`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        title={editing ? `Edit ${cfg.title}` : `Add ${cfg.title}`}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={handleSubmit}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Save' : 'Create'}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          {cfg.fields.map(renderField)}
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceManagerPage;
