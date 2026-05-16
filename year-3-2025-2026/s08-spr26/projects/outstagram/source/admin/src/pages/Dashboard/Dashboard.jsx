import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, Spin } from 'antd';
import { UserOutlined, FileImageOutlined, MessageOutlined, WarningOutlined } from '@ant-design/icons';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0, totalReports: 0 });
    const [userGrowth, setUserGrowth] = useState([]);
    const [postActivity, setPostActivity] = useState([]);
    const [engagement, setEngagement] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                const payload = unwrapApiData(res);
                setStats(payload || { totalUsers: 0, totalPosts: 0, totalComments: 0, totalReports: 0 });
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        const normalize = (payload) => {
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload?.data)) return payload.data;
            return [];
        };

        const fetchCharts = async () => {
            try {
                const [growth, posts, engage] = await Promise.all([
                    api.get('/dashboard/charts/user-growth'),
                    api.get('/dashboard/charts/post-activity'),
                    api.get('/dashboard/charts/engagement'),
                ]);
                setUserGrowth(normalize(unwrapApiData(growth)));
                setPostActivity(normalize(unwrapApiData(posts)));
                setEngagement(normalize(unwrapApiData(engage)));
            } catch (err) {
                console.error('Charts fetch error:', err);
                setUserGrowth([]);
                setPostActivity([]);
                setEngagement([]);
            } finally {
                setChartsLoading(false);
            }
        };

        fetchStats();
        fetchCharts();
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    return (
        <div className="admin-content-card">
            <div className="page-header">
                <div className="page-title">Dashboard Overview</div>
                <div className="page-subtitle">Welcome back, here's what's happening today.</div>
            </div>

            {error && <Alert message={error} type="warning" showIcon className="dashboard-alert" />}

            {/* Stat Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="dashboard-stat-card dashboard-stat-card--users">
                        <Statistic
                            title={<span className="dashboard-stat-title">Total Users</span>}
                            value={stats?.totalUsers || 0}
                            prefix={<UserOutlined />}
                            loading={loading}
                            styles={{ content: { color: '#fff', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="dashboard-stat-card dashboard-stat-card--posts">
                        <Statistic
                            title={<span className="dashboard-stat-title">Total Posts</span>}
                            value={stats?.totalPosts || 0}
                            prefix={<FileImageOutlined />}
                            loading={loading}
                            styles={{ content: { color: '#fff', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="dashboard-stat-card dashboard-stat-card--comments">
                        <Statistic
                            title={<span className="dashboard-stat-title">Total Comments</span>}
                            value={stats?.totalComments || 0}
                            prefix={<MessageOutlined />}
                            loading={loading}
                            styles={{ content: { color: '#fff', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="dashboard-stat-card dashboard-stat-card--reports">
                        <Statistic
                            title={<span className="dashboard-stat-title">Pending Reports</span>}
                            value={stats?.totalReports || 0}
                            prefix={<WarningOutlined />}
                            loading={loading}
                            styles={{ content: { color: '#fff', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row gutter={[24, 24]} className="dashboard-charts-row">
                {/* User Growth */}
                <Col xs={24} lg={12}>
                    <Card title="User Growth (Last 30 Days)" variant="borderless" className="dashboard-chart-card">
                        {chartsLoading ? (
                            <div className="dashboard-chart-loading"><Spin /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        name="New Users"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* Post Activity */}
                <Col xs={24} lg={12}>
                    <Card title="Post Activity (Last 30 Days)" variant="borderless" className="dashboard-chart-card">
                        {chartsLoading ? (
                            <div className="dashboard-chart-loading"><Spin /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={postActivity}>
                                    <defs>
                                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        name="New Posts"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPosts)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Engagement Chart */}
            <Row gutter={[24, 24]}>
                <Col xs={24}>
                    <Card title="Engagement Overview (Last 30 Days)" variant="borderless" className="dashboard-chart-card">
                        {chartsLoading ? (
                            <div className="dashboard-chart-loading"><Spin /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={engagement}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                                    <Legend />
                                    <Bar dataKey="likes" name="Likes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="comments" name="Comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
