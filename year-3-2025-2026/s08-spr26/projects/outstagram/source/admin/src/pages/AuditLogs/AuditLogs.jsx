import React, { useState } from 'react';
import { Table, Input, Select, Space, DatePicker } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import dayjs from 'dayjs';
import './AuditLogs.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ACTION_OPTIONS = [
    'user.create',
    'user.ban',
    'user.unban',
    'user.role_change',
    'post.soft_delete',
    'post.restore',
    'post.hard_delete',
    'comment.soft_delete',
    'comment.restore',
    'config.update',
    'report.resolve',
    'report.dismiss',
    'report.moderate',
    'report.restore_target',
    'report.reopen',
];

const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const [action, setAction] = useState(undefined);
    const [actor, setActor] = useState('');
    const [dateRange, setDateRange] = useState([]);

    const { data, isLoading } = useQuery({
        queryKey: ['auditLogs', page, action, actor, dateRange],
        queryFn: async () => {
            const params = { page, limit: 15, action };
            if (actor) params.actor_username = actor;
            if (dateRange?.length === 2) {
                params.start_date = dateRange[0].startOf('day').toISOString();
                params.end_date = dateRange[1].endOf('day').toISOString();
            }
            const res = await api.get('/audit-logs', { params });
            return unwrapApiData(res);
        },
    });

    const columns = [
        {
            title: 'Admin User',
            dataIndex: 'actor_username',
            key: 'actor',
            render: (text) => <strong>@{text}</strong>,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <code className="audit-action-code">{text}</code>,
        },
        {
            title: 'Target Entity',
            key: 'target',
            render: (_, record) => `${record.target_type} (${record.target_id || 'N/A'})`,
        },
        {
            title: 'Metadata',
            dataIndex: 'metadata',
            key: 'metadata',
            render: (meta) => meta ? <pre className="audit-metadata">{JSON.stringify(meta, null, 2)}</pre> : '-',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY HH:mm:ss'),
        },
    ];

    return (
        <div className="admin-content-card">
            <div className="page-header audit-page-header">
                <div>
                    <div className="page-title">Audit Logs</div>
                    <div className="page-subtitle">Comprehensive history of administrative actions.</div>
                </div>
                <Space size="middle">
                    <Select
                        placeholder="Filter by Action"
                        allowClear
                        size="large"
                        className="audit-filter"
                        onChange={(val) => { setAction(val); setPage(1); }}
                    >
                        {ACTION_OPTIONS.map((option) => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Select>
                    <Search
                        allowClear
                        placeholder="Actor username"
                        onSearch={(val) => { setActor(val); setPage(1); }}
                        style={{ width: 200 }}
                    />
                    <RangePicker
                        onChange={(vals) => { setDateRange(vals || []); setPage(1); }}
                        allowClear
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data?.logs || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: page,
                    total: data?.total || 0,
                    pageSize: 15,
                    onChange: (p) => setPage(p),
                    showSizeChanger: false
                }}
                className="audit-table"
            />
        </div>
    );
};

export default AuditLogs;
