import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Input, Form, Select, message, Descriptions, Avatar, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExclamationCircleOutlined, StopOutlined, CheckCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import useAuthStore from '../../store/authStore';
import dayjs from 'dayjs';
import './Users.css';

const { confirm } = Modal;
const { Search } = Input;

const Users = () => {
    const queryClient = useQueryClient();
    const currentRole = useAuthStore((state) => state.role);
    const canManageStaff = currentRole === 'super_admin';
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createError, setCreateError] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [form] = Form.useForm();

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, search, canManageStaff],
        queryFn: async () => {
            const res = await api.get('/users', {
                params: {
                    page,
                    limit: 10,
                    search,
                    include_staff: canManageStaff ? 'true' : 'false'
                }
            });
            return unwrapApiData(res);
        },
    });

    const { data: userDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['user-details', selectedUserId],
        queryFn: async () => {
            const res = await api.get(`/users/${selectedUserId}`);
            return unwrapApiData(res);
        },
        enabled: !!selectedUserId
    });

    const banMutation = useMutation({
        mutationFn: async ({ id, isBanned }) => {
            if (isBanned) {
                return api.post(`/users/${id}/unban`);
            } else {
                return api.post(`/users/${id}/ban`, { reason: 'Violation of policy' });
            }
        },
        onSuccess: () => {
            message.success('User status updated');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Action failed');
        }
    });

    const createUserMutation = useMutation({
        mutationFn: (values) => api.post('/users', values, { timeout: 15000 }),
        onSuccess: (res) => {
            setCreateError('');
            const data = unwrapApiData(res);
            const pwd = data?.generated_password;
            if (pwd) {
                Modal.success({
                    title: 'User Created',
                    content: (
                        <div>
                            <p>User <strong>@{data.username}</strong> created successfully.</p>
                            <p>Generated password: <code className="users-generated-password">{pwd}</code></p>
                            <p className="users-password-hint">Save this password — it won't be shown again.</p>
                        </div>
                    ),
                });
            } else {
                message.success('User created successfully');
            }
            setCreateModalOpen(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
            const nextError = err.response?.data?.message || 'Failed to create user';
            setCreateError(nextError);
            message.error(nextError);
        }
    });

    const handleBanToggle = (record) => {
        confirm({
            title: record.is_banned ? 'Unban User?' : 'Ban User?',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to ${record.is_banned ? 'unban' : 'ban'} @${record.username}?`,
            onOk() {
                banMutation.mutate({ id: record.user_id, isBanned: record.is_banned });
            },
        });
    };

    const handleCreateUser = async (values) => {
        try {
            setCreateError('');
            const res = await createUserMutation.mutateAsync(values);
            const data = unwrapApiData(res);
            const pwd = data?.generated_password;
            if (pwd) {
                Modal.success({
                    title: 'User Created',
                    content: (
                        <div>
                            <p>User <strong>@{data.username}</strong> created successfully.</p>
                            <p>Generated password: <code className="users-generated-password">{pwd}</code></p>
                            <p className="users-password-hint">Save this password ? it won't be shown again.</p>
                        </div>
                    ),
                });
            } else {
                message.success('User created successfully');
            }
            setCreateModalOpen(false);
            form.resetFields();
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (err) {
            const nextError = err.code === 'ECONNABORTED'
                ? 'Create user request timed out. Please try again.'
                : (err.response?.data?.message || 'Failed to create user');
            setCreateError(nextError);
            message.error(nextError);
        }
    };

    const handleViewDetails = (record) => {
        setSelectedUserId(record.user_id);
        setDetailsModalOpen(true);
    };

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
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'super_admin' ? 'red' : role === 'admin' ? 'orange' : role === 'moderator' ? 'blue' : 'default'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.is_banned ? 'error' : 'success'}>
                    {record.is_banned ? 'BANNED' : 'ACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => handleViewDetails(record)}>Details</Button>
                    <Button
                        type="text"
                        danger={!record.is_banned}
                        icon={record.is_banned ? <CheckCircleOutlined /> : <StopOutlined />}
                        onClick={() => handleBanToggle(record)}
                        disabled={record.role === 'super_admin' || (!canManageStaff && record.role !== 'user')}
                    >
                        {record.is_banned ? 'Unban' : 'Ban'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-content-card">
            <div className="page-header users-page-header">
                <div>
                    <div className="page-title">Users Management</div>
                    <div className="page-subtitle">View and manage user accounts and their statuses.</div>
                </div>
                <Space>
                    <Button type="primary" icon={<UserAddOutlined />} size="large" onClick={() => setCreateModalOpen(true)}>
                        Create User
                    </Button>
                    <Search
                        placeholder="Search by username or name"
                        onSearch={(val) => { setSearch(val); setPage(1); }}
                        className="users-search"
                        allowClear
                        size="large"
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data?.users || []}
                rowKey="user_id"
                loading={isLoading}
                pagination={{
                    current: page,
                    total: data?.total || 0,
                    onChange: (p) => setPage(p),
                    showSizeChanger: false
                }}
                className="users-table"
                rowClassName={(record) => record.is_banned ? 'banned-row' : ''}
            />

            {/* Create User Modal */}
            <Modal
                title="Create New User"
                open={createModalOpen}
                onCancel={() => { setCreateModalOpen(false); setCreateError(''); form.resetFields(); }}
                confirmLoading={createUserMutation.isPending}
                okText="Create"
                okButtonProps={{ htmlType: 'submit', form: 'create-user-form' }}
            >
                <Form
                    id="create-user-form"
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        setCreateError('');
                        handleCreateUser(values);
                    }}
                >
                    {createError ? (
                        <div style={{ marginBottom: 16, color: '#dc2626', fontWeight: 500 }}>
                            {createError}
                        </div>
                    ) : null}
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                        <Input placeholder="user@example.com" />
                    </Form.Item>
                    <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
                        <Input placeholder="john_doe" />
                    </Form.Item>
                    <Form.Item name="display_name" label="Full Name">
                        <Input placeholder="John Doe" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        extra="Leave blank for auto-generated password"
                        rules={[{
                            validator: (_, value) => {
                                if (!value || String(value).length >= 6) return Promise.resolve();
                                return Promise.reject(new Error('Password must be at least 6 characters'));
                            }
                        }]}
                    >
                        <Input.Password placeholder="Optional" />
                    </Form.Item>
                    <Form.Item name="role" label="Role" initialValue="user">
                        <Select options={[
                            { label: 'User', value: 'user' },
                            ...(canManageStaff ? [
                                { label: 'Moderator', value: 'moderator' },
                                { label: 'Admin', value: 'admin' },
                            ] : []),
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* User Details Modal */}
            <Modal
                title="User Profile Details"
                open={detailsModalOpen}
                onCancel={() => { setDetailsModalOpen(false); setSelectedUserId(null); }}
                footer={[
                    <Button key="close" type="primary" onClick={() => { setDetailsModalOpen(false); setSelectedUserId(null); }}>Close</Button>
                ]}
                width={600}
            >
                {isLoadingDetails ? (
                    <div className="users-details-loading"><Spin size="large" /></div>
                ) : userDetails ? (
                    <div>
                        <div className="users-details-profile">
                            <Avatar src={userDetails.profile.avatar_url} size={64} className="users-details-avatar" />
                            <div>
                                <div className="users-details-name">{userDetails.profile.display_name}</div>
                                <div className="users-details-username">@{userDetails.profile.username}</div>
                                <div className="users-details-tags">
                                    <Tag color={userDetails.profile.role === 'super_admin' ? 'red' : userDetails.profile.role === 'admin' ? 'orange' : userDetails.profile.role === 'moderator' ? 'blue' : 'default'}>
                                        {userDetails.profile.role.toUpperCase()}
                                    </Tag>
                                    {userDetails.profile.is_banned && <Tag color="error">BANNED</Tag>}
                                </div>
                            </div>
                        </div>

                        <Divider orientation="left">Activity Statistics</Divider>
                        <Descriptions bordered column={2} size="small" className="users-details-stats">
                            <Descriptions.Item label="Total Posts">{userDetails.stats.posts}</Descriptions.Item>
                            <Descriptions.Item label="Total Comments">{userDetails.stats.comments}</Descriptions.Item>
                            <Descriptions.Item label="Followers">{userDetails.stats.followers}</Descriptions.Item>
                            <Descriptions.Item label="Following">{userDetails.stats.following}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Account Info</Divider>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="User ID"><code>{userDetails.profile.user_id}</code></Descriptions.Item>
                            <Descriptions.Item label="Account Type">{userDetails.profile.is_private ? 'Private' : 'Public'}</Descriptions.Item>
                            <Descriptions.Item label="Joined">
                                {dayjs(userDetails.profile.created_at).format('MMMM D, YYYY HH:mm')}
                            </Descriptions.Item>
                            {userDetails.profile.is_banned && (
                                <>
                                    <Descriptions.Item label="Banned At">
                                        <span className="users-details-banned-text">{dayjs(userDetails.profile.banned_at).format('MMM D, YYYY HH:mm')}</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ban Reason">
                                        <span className="users-details-banned-text">{userDetails.profile.banned_reason}</span>
                                    </Descriptions.Item>
                                </>
                            )}
                        </Descriptions>
                    </div>
                ) : (
                    <div className="users-details-not-found">User not found</div>
                )}
            </Modal>
        </div>
    );
};

export default Users;
