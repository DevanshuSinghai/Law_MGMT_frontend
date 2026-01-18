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
    Drawer,
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
    MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore, useUIStore } from '../../stores';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    const { user, logout, isManager } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed, isMobile, setIsMobile } = useUIStore();

    const [selectedKey, setSelectedKey] = useState('dashboard');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Handle responsive
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Auto-collapse sidebar on mobile
            if (mobile && !sidebarCollapsed) {
                setSidebarCollapsed(true);
            }
        };
        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsMobile, setSidebarCollapsed, sidebarCollapsed]);

    // Update selected key based on location
    useEffect(() => {
        const path = location.pathname.split('/')[1] || 'dashboard';
        setSelectedKey(path);
    }, [location]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleMenuClick = (path) => {
        navigate(path);
        // Close drawer on mobile after navigation
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => handleMenuClick('/dashboard'),
        },
        {
            key: 'cases',
            icon: <FolderOutlined />,
            label: 'Cases',
            onClick: () => handleMenuClick('/cases'),
        },
        {
            key: 'clients',
            icon: <TeamOutlined />,
            label: 'Clients',
            onClick: () => handleMenuClick('/clients'),
        },
        {
            key: 'documents',
            icon: <FileTextOutlined />,
            label: 'Documents',
            onClick: () => handleMenuClick('/documents'),
        },
        {
            key: 'tasks',
            icon: <CheckSquareOutlined />,
            label: 'Tasks',
            onClick: () => handleMenuClick('/tasks'),
        },
        ...(isManager() ? [{
            key: 'team',
            icon: <UserOutlined />,
            label: 'Team',
            onClick: () => handleMenuClick('/team'),
        }] : []),
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => handleMenuClick('/settings'),
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

    // Sidebar content (shared between Sider and Drawer)
    const SidebarContent = () => (
        <>
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
                        fontSize: 18,
                        whiteSpace: 'nowrap',
                    }}
                >
                    Legal Mgmt
                </Text>
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
                style={{ borderRight: 0 }}
            />
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={sidebarCollapsed}
                    breakpoint="lg"
                    collapsedWidth={80}
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
            )}

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                size={250}
                styles={{
                    body: { padding: 0, background: '#001529' },
                    header: { display: 'none' },
                }}
            >
                <SidebarContent />
            </Drawer>

            <Layout
                style={{
                    marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 200),
                    transition: 'margin-left 0.2s',
                }}
            >
                <Header
                    style={{
                        padding: isMobile ? '0 12px' : '0 24px',
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
                    {isMobile ? (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            style={{ fontSize: 18 }}
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleSidebar}
                            style={{ fontSize: 16 }}
                        />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
                        {/* Hide firm name on mobile */}
                        {!isMobile && user?.firm && (
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
                                {!isMobile && <Text strong>{user?.first_name || 'User'}</Text>}
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: isMobile ? 12 : 24,
                        padding: isMobile ? 16 : 24,
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
