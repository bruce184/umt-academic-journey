import React from 'react';
import { Layout, Menu, Button, theme, Dropdown, Badge } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    SettingOutlined,
    LogoutOutlined,
    AlertOutlined,
    TeamOutlined,
    AuditOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import unwrapApiData from '../lib/unwrapApiData';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const { logout, user, role } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    const { data: pendingReports } = useQuery({
        queryKey: ['reports-pending-count'],
        queryFn: async () => {
            const res = await api.get('/reports', {
                params: { status: 'pending', page: 1, limit: 1 }
            });
            return unwrapApiData(res);
        },
        enabled: Boolean(role),
        staleTime: 30000,
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isSuperAdmin = role === 'super_admin';
    const isAdminPlus = role === 'admin' || role === 'super_admin';
    const pendingCount = pendingReports?.total || 0;
    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        ...(isAdminPlus ? [{ key: '/users', icon: <UserOutlined />, label: 'Users' }] : []),
        { key: '/posts', icon: <FileTextOutlined />, label: 'Posts' },
        {
            key: '/reports',
            icon: <AlertOutlined />,
            label: (
                <span className="admin-layout-menu-label">
                    <span>Reports</span>
                    <Badge count={pendingCount} size="small" overflowCount={99} />
                </span>
            )
        },
        ...(isSuperAdmin ? [{ key: '/roles', icon: <TeamOutlined />, label: 'Roles' }] : []),
        ...(isAdminPlus ? [{ key: '/audit-logs', icon: <AuditOutlined />, label: 'Audit Logs' }] : []),
        ...(isSuperAdmin ? [{ key: '/system', icon: <SettingOutlined />, label: 'Settings' }] : []),
    ];

    const userMenu = [
        {
            key: 'role',
            label: `Role: ${role}`,
            disabled: true,
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
        }
    ];

    return (
        <Layout className="admin-layout-wrapper">
            <Sider breakpoint="lg" collapsedWidth="0" width={260} theme="dark">
                <div className="admin-layout-logo">
                    <span className="admin-layout-logo-accent">OUT</span>STAGRAM
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="admin-layout-menu"
                />
            </Sider>
            <Layout>
                <Header className="admin-layout-header" style={{ background: token.colorBgContainer }}>
                    <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                        <Button type="text" size="large" icon={<UserOutlined />}>
                            {user?.email}
                        </Button>
                    </Dropdown>
                </Header>
                <Content className="admin-layout-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
