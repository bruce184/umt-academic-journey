import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Input, message, Descriptions, Avatar, Spin, Divider, Image, List } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExclamationCircleOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import dayjs from 'dayjs';
import './Posts.css';

const { confirm } = Modal;
const { Search } = Input;

const Posts = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['posts', page, search],
        queryFn: async () => {
            const res = await api.get('/posts', { params: { page, limit: 10, search } });
            return unwrapApiData(res);
        },
    });

    const { data: postDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['post-details', selectedPostId],
        queryFn: async () => {
            const res = await api.get(`/posts/${selectedPostId}`);
            return unwrapApiData(res);
        },
        enabled: !!selectedPostId
    });

    const toggleDeleteMutation = useMutation({
        mutationFn: async (id) => {
            return api.patch(`/posts/${id}/soft-delete`);
        },
        onSuccess: () => {
            message.success('Post status updated');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Action failed');
        }
    });

    const toggleCommentMutation = useMutation({
        mutationFn: async ({ postId, commentId }) => api.patch(`/posts/${postId}/comments/${commentId}/soft-delete`),
        onSuccess: () => {
            message.success('Comment status updated');
            queryClient.invalidateQueries({ queryKey: ['post-details', selectedPostId] });
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Action failed');
        }
    });

    const handleSoftDelete = (record) => {
        confirm({
            title: record.is_deleted ? 'Restore Post?' : 'Soft Delete Post?',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to ${record.is_deleted ? 'restore' : 'delete'} this post?`,
            onOk() {
                toggleDeleteMutation.mutate(record.id);
            },
        });
    };

    const handleViewDetails = (record) => {
        setSelectedPostId(record.id);
        setDetailsModalOpen(true);
    };

    const columns = [
        {
            title: 'Owner',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <strong>@{text}</strong>,
        },
        {
            title: 'Caption',
            dataIndex: 'caption',
            key: 'caption',
            render: (text) => text?.length > 50 ? `${text.substring(0, 50)}...` : text || 'N/A',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.is_deleted ? 'error' : 'success'}>
                    {record.is_deleted ? 'DELETED' : 'ACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Posted',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY HH:mm'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => handleViewDetails(record)}>View</Button>
                    <Button
                        type="text"
                        danger={!record.is_deleted}
                        icon={record.is_deleted ? <UndoOutlined /> : <DeleteOutlined />}
                        onClick={() => handleSoftDelete(record)}
                    >
                        {record.is_deleted ? 'Restore' : 'Delete'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-content-card">
            <div className="page-header posts-page-header">
                <div>
                    <div className="page-title">Posts Management</div>
                    <div className="page-subtitle">View, moderate, and manage user posts.</div>
                </div>
                <Search
                    placeholder="Search caption"
                    onSearch={(val) => { setSearch(val); setPage(1); }}
                    className="posts-search"
                    allowClear
                    size="large"
                />
            </div>

            <Table
                columns={columns}
                dataSource={data?.posts || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: page,
                    total: data?.total || 0,
                    onChange: (p) => setPage(p),
                    showSizeChanger: false
                }}
                className="posts-table"
                rowClassName={(record) => record.is_deleted ? 'deleted-row' : ''}
            />

            {/* Post Details Modal */}
            <Modal
                title="Post Details"
                open={detailsModalOpen}
                onCancel={() => { setDetailsModalOpen(false); setSelectedPostId(null); }}
                footer={[
                    <Button key="close" type="primary" onClick={() => { setDetailsModalOpen(false); setSelectedPostId(null); }}>Close</Button>
                ]}
                width={700}
            >
                {isLoadingDetails ? (
                    <div className="posts-details-loading"><Spin size="large" /></div>
                ) : postDetails ? (
                    <div>
                        <div className="posts-details-header">
                            <Avatar src={postDetails.owner?.avatar_url} size={48} className="posts-details-avatar" />
                            <div>
                                <div className="posts-details-owner-name">{postDetails.owner?.display_name || postDetails.owner?.username}</div>
                                <div className="posts-details-owner-username">@{postDetails.owner?.username}</div>
                                <div className="posts-details-date">
                                    Posted on {dayjs(postDetails.created_at).format('MMM D, YYYY HH:mm')}
                                </div>
                            </div>
                            <div className="posts-details-status">
                                <Tag color={postDetails.is_deleted ? 'error' : 'success'}>
                                    {postDetails.is_deleted ? 'DELETED' : 'ACTIVE'}
                                </Tag>
                            </div>
                        </div>

                        <div className="posts-details-caption">
                            {postDetails.caption}
                        </div>

                        {postDetails.media && postDetails.media.length > 0 && (
                            <div className="posts-details-media">
                                <Divider orientation="left">
                                    Media Attached ({postDetails.media.length})
                                    <span className="posts-details-media-hint">(Click to enlarge)</span>
                                </Divider>
                                <Space size={[8, 8]} wrap>
                                    <Image.PreviewGroup>
                                        {postDetails.media.map(m => (
                                            m.media_type === 'video' ? (
                                                <video key={m.id} src={m.media_url} controls className="posts-details-video" />
                                            ) : (
                                                <Image
                                                    key={m.id}
                                                    src={m.media_url}
                                                    height={160}
                                                    className="posts-details-image"
                                                    preview={{ mask: <div>View</div> }}
                                                />
                                            )
                                        ))}
                                    </Image.PreviewGroup>
                                </Space>
                            </div>
                        )}

                        <Divider orientation="left">Engagement Stats</Divider>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Likes">{postDetails.stats?.likes || 0}</Descriptions.Item>
                            <Descriptions.Item label="Comments">{postDetails.stats?.comments || 0}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Comments Moderation</Divider>
                        <List
                            dataSource={postDetails.comments || []}
                            locale={{ emptyText: 'No comments on this post' }}
                            renderItem={(comment) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="toggle"
                                            type="text"
                                            danger={!comment.is_deleted}
                                            icon={comment.is_deleted ? <UndoOutlined /> : <DeleteOutlined />}
                                            onClick={() => toggleCommentMutation.mutate({ postId: selectedPostId, commentId: comment.id })}
                                        >
                                            {comment.is_deleted ? 'Restore' : 'Delete'}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={comment.avatar_url} />}
                                        title={
                                            <Space size="small">
                                                <strong>@{comment.username}</strong>
                                                {comment.parent_id && <Tag>Reply</Tag>}
                                                {comment.is_deleted && <Tag color="error">Deleted</Tag>}
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                <div>{comment.content}</div>
                                                <div className="posts-details-date">{dayjs(comment.created_at).format('MMM D, YYYY HH:mm')}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div className="posts-details-not-found">Post not found</div>
                )}
            </Modal>
        </div>
    );
};

export default Posts;
