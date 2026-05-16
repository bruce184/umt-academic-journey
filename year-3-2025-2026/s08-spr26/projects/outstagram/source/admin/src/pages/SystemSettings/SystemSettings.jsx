import React, { useState } from 'react';
import { Card, Row, Col, Switch, Input, InputNumber, Button, Spin, message, Tag, Divider } from 'antd';
import {
    SettingOutlined, CloudServerOutlined, UserAddOutlined,
    FileImageOutlined, MessageOutlined, EditOutlined, SaveOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import unwrapApiData from '../../lib/unwrapApiData';
import useAuthStore from '../../store/authStore';
import './SystemSettings.css';

const CONFIG_META = {
    maintenance_mode: {
        label: 'Maintenance Mode',
        description: 'When enabled, only admins can access the platform.',
        icon: <CloudServerOutlined />,
        type: 'boolean',
        color: '#ef4444',
    },
    registration_enabled: {
        label: 'User Registration',
        description: 'Allow new users to register.',
        icon: <UserAddOutlined />,
        type: 'boolean',
        color: '#10b981',
    },
    allow_comments: {
        label: 'Allow Comments',
        description: 'Enable or disable commenting across the platform.',
        icon: <MessageOutlined />,
        type: 'boolean',
        color: '#f59e0b',
    },
    max_upload_size_mb: {
        label: 'Max Upload Size (MB)',
        description: 'Maximum file upload size in megabytes.',
        icon: <FileImageOutlined />,
        type: 'number',
        color: '#6366f1',
    },
    posts_per_page: {
        label: 'Posts Per Page',
        description: 'Number of posts shown per page in feeds.',
        icon: <FileImageOutlined />,
        type: 'number',
        color: '#8b5cf6',
    },
};

function parseConfigValue(raw) {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        const n = Number(raw);
        if (!isNaN(n) && raw.trim() !== '') return n;
        return raw;
    }
    return raw;
}

const SystemSettings = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isSuperAdmin = role === 'super_admin';
    const isReadOnly = !isSuperAdmin;
    const [editValues, setEditValues] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ['system-config'],
        queryFn: async () => {
            const res = await api.get('/config');
            const configs = unwrapApiData(res)?.configs || [];
            return configs.filter(c => c.key !== 'site_name');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ key, value }) => api.patch(`/config/${key}`, { value }),
        onSuccess: (_, variables) => {
            message.success(`"${variables.key}" updated`);
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
        },
        onError: (err) => message.error(err.response?.data?.message || 'Update failed')
    });

    const handleToggle = (key, currentParsedValue) => {
        updateMutation.mutate({ key, value: !currentParsedValue });
    };

    const handleSave = (key) => {
        if (editValues[key] !== undefined) {
            updateMutation.mutate({ key, value: editValues[key] });
            setEditValues(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    if (isLoading) {
        return (
            <div className="admin-content-card settings-loading">
                <Spin size="large" />
            </div>
        );
    }

    const booleanConfigs = (data || []).filter(c => CONFIG_META[c.key]?.type === 'boolean');
    const valueConfigs = (data || []).filter(c => CONFIG_META[c.key]?.type === 'number' || CONFIG_META[c.key]?.type === 'text');
    const otherConfigs = (data || []).filter(c => !CONFIG_META[c.key]);

    return (
        <div className="admin-content-card">
            <div className="page-header">
                <div className="page-title">System Configuration</div>
                <div className="page-subtitle">
                    Manage platform-wide settings.
                    {isReadOnly && <Tag color="orange" className="settings-readonly-tag">View Only — Super Admin required to edit</Tag>}
                </div>
            </div>

            {/* Toggle Settings */}
            <h3 className="settings-section-heading">
                <SettingOutlined className="settings-section-icon" />Feature Toggles
            </h3>
            <Row gutter={[16, 16]}>
                {booleanConfigs.map(config => {
                    const meta = CONFIG_META[config.key];
                    const parsed = parseConfigValue(config.raw_value);
                    const isOn = parsed === true;
                    return (
                        <Col xs={24} sm={12} lg={8} key={config.key}>
                            <Card
                                variant="borderless"
                                className="settings-toggle-card"
                                style={{
                                    border: `1px solid ${isOn ? meta.color + '40' : '#f0f0f0'}`,
                                    background: isOn ? meta.color + '08' : '#fafafa',
                                }}
                            >
                                <div className="settings-toggle-card-content">
                                    <div>
                                        <div className="settings-config-label">
                                            <span className="settings-config-icon" style={{ color: meta.color }}>{meta.icon}</span>
                                            {meta.label}
                                        </div>
                                        <div className="settings-config-description">{meta.description}</div>
                                    </div>
                                    <Switch
                                        checked={isOn}
                                        onChange={() => handleToggle(config.key, parsed)}
                                        disabled={isReadOnly}
                                        loading={updateMutation.isLoading}
                                    />
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Value Settings */}
            <Divider />
            <h3 className="settings-section-heading--values">
                <EditOutlined className="settings-section-icon" />Value Settings
            </h3>
            <Row gutter={[16, 16]}>
                {valueConfigs.map(config => {
                    const meta = CONFIG_META[config.key];
                    const parsed = parseConfigValue(config.raw_value);
                    const isEditing = editValues[config.key] !== undefined;
                    return (
                        <Col xs={24} sm={12} key={config.key}>
                            <Card variant="borderless" className="settings-value-card">
                                <div className="settings-value-label">
                                    <span className="settings-config-icon" style={{ color: meta.color }}>{meta.icon}</span>
                                    {meta.label}
                                </div>
                                <div className="settings-value-description">{meta.description}</div>
                                <div className="settings-value-input-row">
                                    {meta.type === 'number' ? (
                                        <InputNumber
                                            value={isEditing ? editValues[config.key] : parsed}
                                            onChange={(val) => setEditValues(prev => ({ ...prev, [config.key]: val }))}
                                            disabled={isReadOnly}
                                            className="settings-value-input"
                                            min={1}
                                        />
                                    ) : (
                                        <Input
                                            value={isEditing ? editValues[config.key] : String(parsed)}
                                            onChange={(e) => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                                            disabled={isReadOnly}
                                            className="settings-value-input"
                                        />
                                    )}
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        onClick={() => handleSave(config.key)}
                                        disabled={isReadOnly || !isEditing}
                                        loading={updateMutation.isLoading}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Unknown / Custom configs */}
            {otherConfigs.length > 0 && (
                <>
                    <Divider />
                    <h3 className="settings-section-heading--values">Other</h3>
                    <Row gutter={[16, 16]}>
                        {otherConfigs.map(config => {
                            const parsed = parseConfigValue(config.raw_value);
                            return (
                                <Col xs={24} sm={12} key={config.key}>
                                    <Card variant="borderless" className="settings-value-card">
                                        <div className="settings-other-label">{config.key}</div>
                                        <div className="settings-other-input-row">
                                            <Input
                                                value={editValues[config.key] !== undefined ? editValues[config.key] : String(parsed)}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                                                disabled={isReadOnly}
                                                className="settings-value-input"
                                            />
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                onClick={() => handleSave(config.key)}
                                                disabled={isReadOnly || editValues[config.key] === undefined}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}
        </div>
    );
};

export default SystemSettings;
