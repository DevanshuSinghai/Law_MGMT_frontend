/**
 * Main layout with sidebar navigation.
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Typography,
    theme,
    Button,
} from 'antd';
import {
    DashboardOutlined,
    FolderOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckSquareOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore, useUIStore } from '../../stores';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    const { user, logout, isManager } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar, isMobile, setIsMobile } = useUIStore();

    const [selectedKey, setSelectedKey] = useState('dashboard');

    // Handle responsive
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsMobile]);

    // Update selected key based on location
    useEffect(() => {
        const path = location.pathname.split('/')[1] || 'dashboard';
        setSelectedKey(path);
    }, [location]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: 'cases',
            icon: <FolderOutlined />,
            label: 'Cases',
            onClick: () => navigate('/cases'),
        },
        {
            key: 'clients',
            icon: <TeamOutlined />,
            label: 'Clients',
            onClick: () => navigate('/clients'),
        },
        {
            key: 'documents',
            icon: <FileTextOutlined />,
            label: 'Documents',
            onClick: () => navigate('/documents'),
        },
        {
            key: 'tasks',
            icon: <CheckSquareOutlined />,
            label: 'Tasks',
            onClick: () => navigate('/tasks'),
        },
        ...(isManager() ? [{
            key: 'team',
            icon: <UserOutlined />,
            label: 'Team',
            onClick: () => navigate('/team'),
        }] : []),
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => navigate('/settings'),
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => navigate('/settings'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={sidebarCollapsed}
                breakpoint="lg"
                collapsedWidth={isMobile ? 0 : 80}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Text
                        strong
                        style={{
                            color: '#fff',
                            fontSize: sidebarCollapsed ? 16 : 18,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {sidebarCollapsed ? 'LM' : 'Legal Mgmt'}
                    </Text>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout
                style={{
                    marginLeft: sidebarCollapsed ? (isMobile ? 0 : 80) : 200,
                    transition: 'margin-left 0.2s',
                }}
            >
                <Header
                    style={{
                        padding: '0 24px',
                        background: token.colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    <Button
                        type="text"
                        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleSidebar}
                        style={{ fontSize: 16 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {user?.firm && (
                            <Text type="secondary" style={{ marginRight: 8 }}>
                                {user.firm.name}
                            </Text>
                        )}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    cursor: 'pointer',
                                }}
                            >
                                <Avatar
                                    style={{ backgroundColor: token.colorPrimary }}
                                    icon={<UserOutlined />}
                                />
                                <Text strong>{user?.first_name || 'User'}</Text>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        minHeight: 280,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
