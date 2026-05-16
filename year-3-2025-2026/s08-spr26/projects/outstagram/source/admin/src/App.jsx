import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin, ConfigProvider } from 'antd';

import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Posts from './pages/Posts/Posts';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import Reports from './pages/Reports/Reports';
import Roles from './pages/Roles/Roles';
import SystemSettings from './pages/SystemSettings/SystemSettings';
import useAuthStore from './store/authStore';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RequireRole = ({ minRole = 'admin', children }) => {
  const { role, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  const order = { moderator: 1, admin: 2, super_admin: 3 };
  if (!role || (order[role] || 0) < (order[minRole] || 2)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          colorInfo: '#2563eb',
          colorSuccess: '#16a34a',
          colorError: '#dc2626',
          colorWarning: '#d97706',
          colorTextBase: '#0f172a',
          colorBgBase: '#f4f7fb',
          colorBorder: '#dbe7f4',
          colorBorderSecondary: '#e5edf7',
          borderRadius: 14,
          borderRadiusLG: 20,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Layout: {
            headerBg: 'rgba(255,255,255,0.82)',
            siderBg: '#08111f',
          },
          Menu: {
            darkItemBg: '#08111f',
            darkItemHoverBg: 'rgba(148, 163, 184, 0.12)',
            darkItemSelectedBg: 'rgba(37, 99, 235, 0.2)',
            darkItemSelectedColor: '#ffffff',
            itemBorderRadius: 14,
            itemMarginInline: 0,
          },
          Button: {
            borderRadius: 14,
            controlHeight: 40,
            controlHeightLG: 46,
            fontWeight: 600,
            primaryShadow: '0 14px 30px rgba(37, 99, 235, 0.24)',
          },
          Card: {
            borderRadiusLG: 20,
          },
          Input: {
            activeShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
            hoverBorderColor: '#93c5fd',
          },
          InputNumber: {
            activeShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
          },
          Select: {
            optionSelectedBg: '#eff6ff',
            activeBorderColor: '#2563eb',
          },
          DatePicker: {
            activeShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
          },
          Table: {
            headerBg: '#f8fbff',
            headerColor: '#334155',
            borderColor: '#e5edf7',
            rowHoverBg: '#f8fbff',
            headerSplitColor: '#e5edf7',
          },
          Modal: {
            borderRadiusLG: 24,
          },
          Tag: {
            borderRadiusSM: 999,
          },
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="users"
                element={
                  <RequireRole minRole="admin">
                    <Users />
                  </RequireRole>
                }
              />
              <Route path="posts" element={<Posts />} />
              <Route
                path="audit-logs"
                element={
                  <RequireRole minRole="admin">
                    <AuditLogs />
                  </RequireRole>
                }
              />
              <Route path="reports" element={<Reports />} />
              <Route
                path="roles"
                element={
                  <RequireRole minRole="super_admin">
                    <Roles />
                  </RequireRole>
                }
              />
              <Route
                path="system"
                element={
                  <RequireRole minRole="super_admin">
                    <SystemSettings />
                  </RequireRole>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;
