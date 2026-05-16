import React, { useState } from 'react';
import {
    Alert,
    Avatar,
    Button,
    Descriptions,
    Empty,
    Image,
    List,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    message
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    StopOutlined,
    WarningOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import useAuthStore from '../../store/authStore';
import dayjs from 'dayjs';
import './Reports.css';

const STATUS_COLORS = {
    pending: 'orange',
    resolved: 'green',
    dismissed: 'default'
};

const TARGET_ACTIONS = {
    post: { action: 'remove_post', label: 'Remove Post' },
    comment: { action: 'remove_comment', label: 'Remove Comment' },
    story: { action: 'remove_story', label: 'Remove Story' },
    user: { action: 'ban_user', label: 'Ban User' }
};

const TARGET_RESTORE_ACTIONS = {
    post: { action: 'restore_post', label: 'Restore Post' },
    comment: { action: 'restore_comment', label: 'Restore Comment' },
    story: { action: 'restore_story', label: 'Restore Story' },
    user: { action: 'unban_user', label: 'Unban User' }
};

const ACTION_LABELS = {
    remove_post: 'Remove Post',
    remove_comment: 'Remove Comment',
    remove_story: 'Remove Story',
    ban_user: 'Ban User',
    restore_post: 'Restore Post',
    restore_comment: 'Restore Comment',
    restore_story: 'Restore Story',
    unban_user: 'Unban User'
};

const typeLabelMap = {
    post: 'Post',
    comment: 'Comment',
    user: 'User',
    story: 'Story',
    problem: 'Problem',
    profile: 'User'
};

const typeLabel = (type) => typeLabelMap[type] || type;

const getTargetActionConfig = (report, target) => {
    if (!report || !target) return null;

    switch (report.target_type) {
        case 'post':
        case 'comment':
        case 'story':
            return target.is_deleted ? { ...TARGET_RESTORE_ACTIONS[report.target_type], variant: 'restore' } : { ...TARGET_ACTIONS[report.target_type], variant: 'moderate' };
        case 'user':
            return target.is_banned ? { ...TARGET_RESTORE_ACTIONS.user, variant: 'restore' } : { ...TARGET_ACTIONS.user, variant: 'moderate' };
        default:
            return null;
    }
};

const renderModerationSummary = (insights) => {
    const counts = insights?.counts;
    if (!counts) return null;

    return (
        <div className="reports-stats-grid">
            <div className="reports-stat-card">
                <span className="reports-stat-label">Total reports</span>
                <strong>{counts.total || 0}</strong>
            </div>
            <div className="reports-stat-card">
                <span className="reports-stat-label">Pending</span>
                <strong>{counts.pending || 0}</strong>
            </div>
            <div className="reports-stat-card">
                <span className="reports-stat-label">Resolved</span>
                <strong>{counts.resolved || 0}</strong>
            </div>
            <div className="reports-stat-card">
                <span className="reports-stat-label">Dismissed</span>
                <strong>{counts.dismissed || 0}</strong>
            </div>
        </div>
    );
};

const renderMediaGallery = (media = []) => {
    if (!Array.isArray(media) || media.length === 0) {
        return <div className="reports-muted">No media attached</div>;
    }

    return (
        <div className="reports-media-grid">
            <Image.PreviewGroup>
                {media.map((item) => (
                    item.media_type === 'video' ? (
                        <video
                            key={item.id}
                            src={item.media_url}
                            controls
                            className="reports-media-video"
                        />
                    ) : (
                        <Image
                            key={item.id}
                            src={item.media_url}
                            alt="Reported media"
                            className="reports-media-image"
                            preview={{ mask: 'View' }}
                        />
                    )
                ))}
            </Image.PreviewGroup>
        </div>
    );
};

const renderRelatedReports = (insights) => {
    const recent = insights?.recent || [];

    return (
        <div className="reports-related-block">
            <div className="reports-section-heading">Report history on this target</div>
            {renderModerationSummary(insights)}
            <List
                className="reports-related-list"
                locale={{ emptyText: 'No related report history' }}
                dataSource={recent}
                renderItem={(item) => (
                    <List.Item>
                        <div className="reports-related-item">
                            <div className="reports-related-topline">
                                <strong>@{item.reporter_username || 'unknown'}</strong>
                                <Tag color={STATUS_COLORS[item.status] || 'default'}>
                                    {item.status?.toUpperCase()}
                                </Tag>
                            </div>
                            <div className="reports-related-reason">
                                {item.reason || 'No reason provided'}
                            </div>
                            <div className="reports-related-meta">
                                {dayjs(item.created_at).format('MMM D, YYYY HH:mm')}
                                {item.resolved_by_username ? ` • handled by @${item.resolved_by_username}` : ''}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

const renderUserHeader = ({ avatarUrl, username, displayName, role, isBanned }) => (
    <div className="reports-user-header">
        <Avatar src={avatarUrl} size={52}>
            {username?.[0]?.toUpperCase()}
        </Avatar>
        <div className="reports-user-meta">
            <div className="reports-user-title">
                <strong>@{username || 'unknown'}</strong>
                {displayName ? <span>{displayName}</span> : null}
            </div>
            <div className="reports-user-tags">
                {role ? <Tag>{role}</Tag> : null}
                <Tag color={isBanned ? 'red' : 'green'}>
                    {isBanned ? 'Banned' : 'Active'}
                </Tag>
            </div>
        </div>
    </div>
);

const renderTargetSummary = (report, target, insights) => {
    if (!report) return null;

    if (!target && report.target_type !== 'problem') {
        return (
            <Alert
                type="warning"
                showIcon
                message="Target is no longer available"
                description="The reported post, comment, story, or user could not be loaded. You can still resolve or dismiss the report after review."
            />
        );
    }

    switch (report.target_type) {
        case 'post':
            return (
                <div className="reports-target-stack">
                    {renderUserHeader({
                        avatarUrl: target.owner_avatar_url,
                        username: target.owner_username,
                        displayName: target.owner_display_name,
                        role: target.owner_role,
                        isBanned: target.owner_is_banned
                    })}

                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Created">
                            {dayjs(target.created_at).format('MMM D, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={target.is_deleted ? 'red' : 'green'}>
                                {target.is_deleted ? 'Removed' : 'Active'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Likes">
                            {target.stats?.likes ?? 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Comments">
                            {target.stats?.comments ?? 0}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Caption</div>
                        <Typography.Paragraph className="reports-reason-block">
                            {target.caption || 'No caption'}
                        </Typography.Paragraph>
                    </div>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Media preview</div>
                        {renderMediaGallery(target.media)}
                    </div>

                    {renderRelatedReports(insights)}
                </div>
            );
        case 'comment':
            return (
                <div className="reports-target-stack">
                    {renderUserHeader({
                        avatarUrl: target.author_avatar_url,
                        username: target.author_username,
                        displayName: target.author_display_name,
                        role: target.author_role,
                        isBanned: target.author_is_banned
                    })}

                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Post ID">
                            {target.post_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={target.is_deleted ? 'red' : 'green'}>
                                {target.is_deleted ? 'Removed' : 'Active'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Created">
                            {dayjs(target.created_at).format('MMM D, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reply">
                            {target.parent_id ? 'Yes' : 'No'}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Reported comment</div>
                        <Typography.Paragraph className="reports-reason-block">
                            {target.content || 'Empty comment'}
                        </Typography.Paragraph>
                    </div>

                    {target.post ? (
                        <div className="reports-nested-card">
                            <div className="reports-section-heading">Post context</div>
                            {renderUserHeader({
                                avatarUrl: target.post.owner_avatar_url,
                                username: target.post.owner_username,
                                displayName: target.post.owner_display_name,
                                role: target.post.owner_role,
                                isBanned: target.post.owner_is_banned
                            })}
                            <Typography.Paragraph className="reports-reason-block">
                                {target.post.caption || 'No caption'}
                            </Typography.Paragraph>
                            {renderMediaGallery(target.post.media)}
                        </div>
                    ) : null}

                    {renderRelatedReports(insights)}
                </div>
            );
        case 'user':
            return (
                <div className="reports-target-stack">
                    {renderUserHeader({
                        avatarUrl: target.avatar_url,
                        username: target.username,
                        displayName: target.display_name,
                        role: target.role,
                        isBanned: target.is_banned
                    })}

                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Joined">
                            {dayjs(target.created_at).format('MMM D, YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Private account">
                            {target.is_private ? 'Yes' : 'No'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Active posts">
                            {target.active_posts ?? 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Comments">
                            {target.active_comments ?? 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Followers">
                            {target.followers ?? 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Following">
                            {target.following ?? 0}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Bio</div>
                        <Typography.Paragraph className="reports-reason-block">
                            {target.bio || 'No bio'}
                        </Typography.Paragraph>
                    </div>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Recent posts</div>
                        <List
                            className="reports-post-list"
                            locale={{ emptyText: 'No recent posts' }}
                            dataSource={target.recent_posts || []}
                            renderItem={(post) => (
                                <List.Item>
                                    <div className="reports-post-item">
                                        <div className="reports-post-item-copy">
                                            <strong>Post #{post.id}</strong>
                                            <div className="reports-related-meta">
                                                {dayjs(post.created_at).format('MMM D, YYYY HH:mm')}
                                            </div>
                                            <div className="reports-related-reason">
                                                {post.caption || 'No caption'}
                                            </div>
                                        </div>
                                        <div className="reports-post-item-media">
                                            {renderMediaGallery(post.media?.slice(0, 2))}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>

                    {renderRelatedReports(insights)}
                </div>
            );
        case 'story':
            return (
                <div className="reports-target-stack">
                    {renderUserHeader({
                        avatarUrl: target.owner_avatar_url,
                        username: target.owner_username,
                        displayName: target.owner_display_name,
                        role: target.owner_role,
                        isBanned: target.owner_is_banned
                    })}

                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Created">
                            {dayjs(target.created_at).format('MMM D, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={target.is_deleted ? 'red' : 'green'}>
                                {target.is_deleted ? 'Removed' : 'Active'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Media type">
                            <Tag color="blue">{target.media_type || 'unknown'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Views">
                            {target.views ?? 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Expires">
                            {target.expires_at ? dayjs(target.expires_at).format('MMM D, YYYY HH:mm') : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Expired">
                            {target.expires_at && dayjs(target.expires_at).isBefore(dayjs()) ? 'Yes' : 'No'}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Story caption</div>
                        <Typography.Paragraph className="reports-reason-block">
                            {target.caption || 'No caption'}
                        </Typography.Paragraph>
                    </div>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Story preview</div>
                        {renderMediaGallery([{ id: target.id, media_type: target.media_type, media_url: target.media_url }])}
                    </div>

                    {renderRelatedReports(insights)}
                </div>
            );
        case 'problem':
            return (
                <div className="reports-target-stack">
                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Category">
                            <Tag color="gold">{target.category || 'general'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Page">
                            {target.page || <span className="reports-muted">Not provided</span>}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="reports-content-block">
                        <div className="reports-section-heading">Issue description</div>
                        <Typography.Paragraph className="reports-reason-block">
                            {target.description || 'No description'}
                        </Typography.Paragraph>
                    </div>

                    {renderRelatedReports(insights)}
                </div>
            );
        default:
            return <Empty description="Unsupported report target" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
};

const Reports = () => {
    const queryClient = useQueryClient();
    const role = useAuthStore((state) => state.role);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedReportId, setSelectedReportId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['reports', page, statusFilter, typeFilter],
        queryFn: async () => {
            const params = { page, limit: 20 };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.target_type = typeFilter;
            const res = await api.get('/reports', { params });
            return unwrapApiData(res);
        },
    });

    const { data: reviewData, isLoading: isReviewLoading } = useQuery({
        queryKey: ['report-details', selectedReportId],
        queryFn: async () => {
            const res = await api.get(`/reports/${selectedReportId}`);
            return unwrapApiData(res);
        },
        enabled: Boolean(selectedReportId),
    });

    const resolveMutation = useMutation({
        mutationFn: (id) => api.patch(`/reports/${id}/resolve`),
        onSuccess: () => {
            message.success('Report resolved');
            setSelectedReportId(null);
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['report-details'] });
            queryClient.invalidateQueries({ queryKey: ['reports-pending-count'] });
        },
        onError: (err) => message.error(err.response?.data?.message || 'Action failed')
    });

    const dismissMutation = useMutation({
        mutationFn: (id) => api.patch(`/reports/${id}/dismiss`),
        onSuccess: () => {
            message.success('Report dismissed');
            setSelectedReportId(null);
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['report-details'] });
            queryClient.invalidateQueries({ queryKey: ['reports-pending-count'] });
        },
        onError: (err) => message.error(err.response?.data?.message || 'Action failed')
    });

    const reopenMutation = useMutation({
        mutationFn: (id) => api.patch(`/reports/${id}/reopen`),
        onSuccess: () => {
            message.success('Report reopened');
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['report-details', selectedReportId] });
            queryClient.invalidateQueries({ queryKey: ['reports-pending-count'] });
        },
        onError: (err) => message.error(err.response?.data?.message || 'Action failed')
    });

    const targetActionMutation = useMutation({
        mutationFn: ({ id, action }) => api.patch(`/reports/${id}/moderate`, { action }),
        onSuccess: (_, variables) => {
            const actionLabel = ACTION_LABELS[variables.action] || variables.action;
            message.success(`${actionLabel} completed`);
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['report-details', selectedReportId] });
            queryClient.invalidateQueries({ queryKey: ['reports-pending-count'] });
            if (!String(variables.action).startsWith('restore_') && variables.action !== 'unban_user') {
                setSelectedReportId(null);
            }
        },
        onError: (err) => message.error(err.response?.data?.message || 'Action failed')
    });

    const reviewReport = reviewData?.report;
    const reviewTarget = reviewData?.target;
    const reviewInsights = reviewData?.insights;
    const pendingReview = reviewReport?.status === 'pending';
    const targetAction = getTargetActionConfig(reviewReport, reviewTarget);
    const canManageUserTarget = ['admin', 'super_admin'].includes(role);
    const isRestoreAction = targetAction?.variant === 'restore';
    const showTargetAction = Boolean(targetAction && (isRestoreAction || pendingReview));
    const canRunTargetAction = Boolean(
        targetAction &&
        (isRestoreAction || pendingReview) &&
        (reviewReport?.target_type !== 'user' || canManageUserTarget) &&
        (reviewReport?.target_type === 'problem' || reviewTarget)
    );
    const modalFooter = [
        <Button key="close" onClick={() => setSelectedReportId(null)}>
            Close
        </Button>,
        ...(pendingReview ? [
            <Button
                key="dismiss"
                icon={<CloseCircleOutlined />}
                onClick={() => dismissMutation.mutate(selectedReportId)}
                disabled={!pendingReview}
                loading={dismissMutation.isPending}
            >
                Dismiss
            </Button>,
            <Button
                key="resolve"
                icon={<CheckCircleOutlined />}
                onClick={() => resolveMutation.mutate(selectedReportId)}
                disabled={!pendingReview}
                loading={resolveMutation.isPending}
            >
                Resolve
            </Button>
        ] : [
            <Button
                key="reopen"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => reopenMutation.mutate(selectedReportId)}
                loading={reopenMutation.isPending}
            >
                Reopen
            </Button>
        ]),
        ...(showTargetAction ? [
            <Button
                key="target-action"
                type="primary"
                danger={!isRestoreAction}
                icon={
                    isRestoreAction
                        ? <ReloadOutlined />
                        : (reviewReport?.target_type === 'user' ? <StopOutlined /> : <WarningOutlined />)
                }
                onClick={() => targetActionMutation.mutate({ id: selectedReportId, action: targetAction.action })}
                disabled={!canRunTargetAction}
                loading={targetActionMutation.isPending}
            >
                {targetAction.label}
            </Button>
        ] : [])
    ];

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Reporter',
            dataIndex: 'reporter_username',
            key: 'reporter_username',
            render: (text) => <strong>@{text}</strong>,
        },
        {
            title: 'Type',
            dataIndex: 'target_type',
            key: 'target_type',
            render: (type) => <Tag color="blue">{typeLabel(type)}</Tag>,
        },
        {
            title: 'Target',
            key: 'target',
            render: (_, record) => {
                if (record.target_type === 'problem') return 'Problem report';
                return `${typeLabel(record.target_type)} #${record.target_id}`;
            },
        },
        {
            title: 'Reason / Context',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true,
            width: 320,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return <Tag color={STATUS_COLORS[status] || 'default'}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Resolved By',
            dataIndex: 'resolved_by_username',
            key: 'resolved_by_username',
            render: (text) => text ? `@${text}` : '—',
        },
        {
            title: 'Reported At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY HH:mm'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedReportId(record.id)}
                    >
                        {record.status === 'pending' ? 'Review' : 'View'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="admin-content-card">
                <div className="page-header reports-page-header">
                    <div>
                        <div className="page-title">Reports Queue</div>
                        <div className="page-subtitle">Review reports, inspect the target, then take the matching moderation action.</div>
                    </div>
                    <Space>
                        <Select
                            placeholder="Status"
                            allowClear
                            className="reports-filter"
                            size="large"
                            onChange={(val) => { setStatusFilter(val || ''); setPage(1); }}
                            options={[
                                { label: 'Pending', value: 'pending' },
                                { label: 'Resolved', value: 'resolved' },
                                { label: 'Dismissed', value: 'dismissed' },
                            ]}
                        />
                        <Select
                            placeholder="Type"
                            allowClear
                            className="reports-filter"
                            size="large"
                            onChange={(val) => { setTypeFilter(val || ''); setPage(1); }}
                            options={[
                                { label: 'Post', value: 'post' },
                                { label: 'Comment', value: 'comment' },
                                { label: 'User', value: 'user' },
                                { label: 'Story', value: 'story' },
                                { label: 'Problem', value: 'problem' },
                            ]}
                        />
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data?.reports || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page,
                        total: data?.total || 0,
                        pageSize: 20,
                        onChange: (p) => setPage(p),
                        showSizeChanger: false
                    }}
                    className="reports-table"
                />
            </div>

            <Modal
                open={Boolean(selectedReportId)}
                onCancel={() => setSelectedReportId(null)}
                title="Report Review"
                width={1040}
                footer={modalFooter}
                className="reports-review-modal"
            >
                {isReviewLoading ? (
                    <div className="reports-modal-loading">Loading report details...</div>
                ) : !reviewReport ? (
                    <Empty description="Failed to load report details" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <Space direction="vertical" size={16} className="reports-modal-content">
                        <Alert
                            type={pendingReview ? 'info' : 'success'}
                            showIcon
                            message={pendingReview ? 'Pending moderation decision' : `Report already ${reviewReport.status}`}
                            description={
                                pendingReview
                                    ? 'Review the reported target and choose the matching moderation outcome.'
                                    : `Processed by @${reviewReport.resolved_by_username || 'unknown'} at ${reviewReport.resolved_at ? dayjs(reviewReport.resolved_at).format('MMM D, YYYY HH:mm') : 'unknown time'}. Use Reopen if this decision needs to be reviewed again.`
                            }
                        />

                        {!pendingReview ? (
                            <Alert
                                type="warning"
                                showIcon
                                message="Reopen only changes the report status"
                                description="Reopen sends this report back to pending review. If the target is currently removed or banned, use the restore action in this modal to undo that moderation."
                            />
                        ) : null}

                        {!canManageUserTarget && reviewReport.target_type === 'user' ? (
                            <Alert
                                type="warning"
                                showIcon
                                message="Only admin or super admin can manage a reported user account"
                            />
                        ) : null}

                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Report ID">
                                #{reviewReport.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color="blue">{typeLabel(reviewReport.target_type)}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Reporter">
                                @{reviewReport.reporter_username || 'unknown'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={STATUS_COLORS[reviewReport.status] || 'default'}>
                                    {reviewReport.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Target">
                                {reviewReport.target_type === 'problem'
                                    ? 'Problem report'
                                    : `${typeLabel(reviewReport.target_type)} #${reviewReport.target_id}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Reported at">
                                {dayjs(reviewReport.created_at).format('MMM D, YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="reports-section">
                            <Typography.Text strong>Reporter reason</Typography.Text>
                            <Typography.Paragraph className="reports-reason-block">
                                {reviewReport.reason || 'No reason provided'}
                            </Typography.Paragraph>
                        </div>

                        <div className="reports-section">
                            <Typography.Text strong>Target details</Typography.Text>
                            <div className="reports-target-card">
                                {renderTargetSummary(reviewReport, reviewTarget, reviewInsights)}
                            </div>
                        </div>
                    </Space>
                )}
            </Modal>
        </>
    );
};

export default Reports;
