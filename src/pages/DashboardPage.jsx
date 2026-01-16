/**
 * Dashboard page with stats, deadlines, and activity.
 */

import { Row, Col, Card, Statistic, List, Tag, Typography, Empty, Spin } from 'antd';
import {
    FolderOutlined,
    CheckSquareOutlined,
    FileTextOutlined,
    TeamOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useDashboardStats, useDashboardDeadlines, useDashboardActivity } from '../hooks';
import { useAuthStore } from '../stores';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const DashboardPage = () => {
    const navigate = useNavigate();
    const { isManager } = useAuthStore();

    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: deadlines, isLoading: deadlinesLoading } = useDashboardDeadlines(14);
    const { data: activity, isLoading: activityLoading } = useDashboardActivity(10);

    const StatCard = ({ title, value, icon, color, onClick }) => (
        <Card
            hoverable={!!onClick}
            onClick={onClick}
            style={{ height: '100%' }}
        >
            <Statistic
                title={title}
                value={value || 0}
                prefix={icon}
                valueStyle={{ color }}
            />
        </Card>
    );

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

    const getDeadlineColor = (date) => {
        const d = dayjs(date);
        const today = dayjs();
        if (d.isBefore(today, 'day')) return 'red';
        if (d.isSame(today, 'day')) return 'orange';
        if (d.diff(today, 'day') <= 3) return 'gold';
        return 'green';
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

            {/* Stats Row */}
            <Spin spinning={statsLoading}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={12} md={6}>
                        <StatCard
                            title="Total Cases"
                            value={stats?.cases?.total}
                            icon={<FolderOutlined />}
                            color="#1677ff"
                            onClick={() => navigate('/cases')}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <StatCard
                            title="Active Cases"
                            value={(stats?.cases?.open || 0) + (stats?.cases?.in_progress || 0)}
                            icon={<FolderOutlined />}
                            color="#52c41a"
                            onClick={() => navigate('/cases?status=in_progress')}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <StatCard
                            title="Pending Tasks"
                            value={stats?.tasks?.pending}
                            icon={<CheckSquareOutlined />}
                            color="#faad14"
                            onClick={() => navigate('/tasks?status=pending')}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <StatCard
                            title="Overdue Tasks"
                            value={stats?.tasks?.overdue}
                            icon={<ClockCircleOutlined />}
                            color="#ff4d4f"
                            onClick={() => navigate('/tasks')}
                        />
                    </Col>
                </Row>

                {isManager() && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={12} sm={12} md={6}>
                            <StatCard
                                title="Total Documents"
                                value={stats?.documents?.total}
                                icon={<FileTextOutlined />}
                                color="#722ed1"
                                onClick={() => navigate('/documents')}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <StatCard
                                title="Total Clients"
                                value={stats?.clients?.total}
                                icon={<TeamOutlined />}
                                color="#13c2c2"
                                onClick={() => navigate('/clients')}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <StatCard
                                title="Team Members"
                                value={stats?.team?.total}
                                icon={<TeamOutlined />}
                                color="#eb2f96"
                                onClick={() => navigate('/team')}
                            />
                        </Col>
                    </Row>
                )}
            </Spin>

            <Row gutter={[16, 16]}>
                {/* Upcoming Deadlines */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Upcoming Deadlines
                            </span>
                        }
                        extra={<a onClick={() => navigate('/cases')}>View All</a>}
                    >
                        <Spin spinning={deadlinesLoading}>
                            {deadlines?.length > 0 ? (
                                <List
                                    size="small"
                                    dataSource={deadlines.slice(0, 8)}
                                    renderItem={(item) => (
                                        <List.Item
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/cases/${item.case_id}`)}
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Tag color={item.type === 'hearing' ? 'purple' : 'blue'}>
                                                            {item.type === 'hearing' ? 'Hearing' : 'Task'}
                                                        </Tag>
                                                        <Text ellipsis style={{ maxWidth: 200 }}>{item.title}</Text>
                                                    </div>
                                                }
                                                description={
                                                    <Text type="secondary">{item.case_number}</Text>
                                                }
                                            />
                                            <Tag color={getDeadlineColor(item.date)}>
                                                {dayjs(item.date).format('MMM DD')}
                                            </Tag>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="No upcoming deadlines" />
                            )}
                        </Spin>
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span>
                                <ClockCircleOutlined style={{ marginRight: 8 }} />
                                Recent Activity
                            </span>
                        }
                    >
                        <Spin spinning={activityLoading}>
                            {activity?.length > 0 ? (
                                <List
                                    size="small"
                                    dataSource={activity.slice(0, 8)}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={
                                                    <Text>
                                                        <Text strong>{item.user}</Text>
                                                        {' '}
                                                        {item.action}
                                                        {' '}
                                                        <Text code>{item.entity_name}</Text>
                                                    </Text>
                                                }
                                                description={
                                                    <Text type="secondary">
                                                        {dayjs(item.created_at).fromNow()}
                                                    </Text>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="No recent activity" />
                            )}
                        </Spin>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
