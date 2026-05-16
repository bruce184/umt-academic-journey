import React, { useMemo, useState } from 'react';
import { Table, Tag, Modal, Select, Input, Space, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CrownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import useAuthStore from '../../store/authStore';
import dayjs from 'dayjs';
import './Roles.css';

const { confirm } = Modal;

const ROLE_OPTIONS = [
    { label: 'User', value: 'user' },
    { label: 'Moderator', value: 'moderator' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'super_admin' },
];

const Roles = () => {
    const queryClient = useQueryClient();
    const { role: currentRole, user: currentUser } = useAuthStore();
    const isSuperAdmin = currentRole === 'super_admin';
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    if (!isSuperAdmin) {
        return (
            <div className="admin-content-card">
                <div className="page-header">
                    <div className="page-title">Role Management</div>
                    <div className="page-subtitle">Only super admins can view or change roles.</div>
                </div>
                <div className="roles-locked">Access denied.</div>
            </div>
        );
    }

    const { data, isLoading } = useQuery({
        queryKey: ['role-users'],
        queryFn: async () => {
            const res = await api.get('/roles/admins');
            return unwrapApiData(res);
        }
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }) => api.patch(`/roles/${id}/role`, { role }),
        onSuccess: () => {
            message.success('Role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['role-users'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => message.error(err.response?.data?.message || 'Action failed')
    });

    const handleRoleChange = (record, newRole) => {
        confirm({
            title: 'Change User Role?',
            icon: <ExclamationCircleOutlined />,
            content: `Change @${record.username}'s role from "${record.role}" to "${newRole}"?`,
            onOk() {
                changeRoleMutation.mutate({ id: record.user_id, role: newRole });
            }
        });
    };

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return (data?.users || []).filter((record) => {
            const matchRole = roleFilter === 'all' || record.role === roleFilter;
            if (!matchRole) return false;
            if (!keyword) return true;

            const username = String(record.username || '').toLowerCase();
            const displayName = String(record.display_name || '').toLowerCase();
            return username.includes(keyword) || displayName.includes(keyword);
        });
    }, [data?.users, roleFilter, search]);

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <strong>@{text}</strong>,
        },
        {
            title: 'Display Name',
            dataIndex: 'display_name',
            key: 'display_name',
        },
        {
            title: 'Current Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colorMap = { super_admin: 'red', admin: 'orange', moderator: 'blue' };
                return (
                    <Tag icon={role === 'super_admin' ? <CrownOutlined /> : null} color={colorMap[role] || 'default'}>
                        {role.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Change Role',
            key: 'change_role',
            render: (_, record) => (
                <Select
                    value={record.role}
                    className="roles-select"
                    onChange={(val) => handleRoleChange(record, val)}
                    options={ROLE_OPTIONS}
                    disabled={!isSuperAdmin || record.user_id === currentUser?.id}
                />
            ),
        },
    ];

    return (
        <div className="admin-content-card">
            <div className="page-header">
                <div>
                    <div className="page-title">Role Management</div>
                    <div className="page-subtitle">View and manage roles for all accounts. You cannot change your own role.</div>
                </div>
                <Space wrap className="roles-filters">
                    <Input.Search
                        allowClear
                        placeholder="Search username or name"
                        className="roles-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                        value={roleFilter}
                        onChange={setRoleFilter}
                        className="roles-filter-select"
                        options={[
                            { label: 'All roles', value: 'all' },
                            ...ROLE_OPTIONS,
                        ]}
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="user_id"
                loading={isLoading}
                pagination={false}
                className="roles-table"
            />
        </div>
    );
};

export default Roles;
