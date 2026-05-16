import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthController } from './controllers/AuthController';
import Layout from './components/common/Layout';
import LoginView from './views/LoginView';
import StudentDashboardView from './views/student/StudentDashboardView';

// Import Views (MVC Architecture)
import StudentAttendanceView from './views/student/StudentAttendanceView';
import StudentScheduleView from './views/student/StudentScheduleView';
import StudentAnnouncementView from './views/student/StudentAnnouncementView';
import StudentClassesView from './views/student/StudentClassesView';
import StudentCoursesView from './views/student/StudentCoursesView';
import StudentTuitionFeeView from './views/student/StudentTuitionFeeView';
import StudentProfileView from './views/student/StudentProfileView';

// Lecturer Views
import LecturerDashboardView from './views/lecturer/LecturerDashboardView';
import LecturerAttendanceView from './views/lecturer/LecturerAttendanceView';
import LecturerScheduleView from './views/lecturer/LecturerScheduleView';
import LecturerAnnouncementView from './views/lecturer/LecturerAnnouncementView';
import LecturerClassesView from './views/lecturer/LecturerClassesView';
import LecturerCoursesView from './views/lecturer/LecturerCoursesView';
import LecturerProfileView from './views/lecturer/LecturerProfileView';

// Admin Views
import AdminDashboardView from './views/admin/AdminDashboardView';
import AdminAccountsView from './views/admin/AdminAccountsView';
import AdminStudentsView from './views/admin/AdminStudentsView';
import AdminLecturersView from './views/admin/AdminLecturersView';
import AdminCoursesView from './views/admin/AdminCoursesView';
import AdminClassesView from './views/admin/AdminClassesView';
import AdminEnrollmentView from './views/admin/AdminEnrollmentView';
import AdminAnnouncementView from './views/admin/AdminAnnouncementView';
import AdminAttendanceReportsView from './views/admin/AdminAttendanceReportsView';
import AdminSettingsView from './views/admin/AdminSettingsView';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: ('student' | 'lecturer' | 'admin')[];
}> = ({ children, allowedRoles }) => {
  const isLoggedIn = AuthController.isLoggedIn();
  const currentRole = AuthController.getCurrentRole();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentRole && !allowedRoles.includes(currentRole)) {
    // Redirect to appropriate dashboard based on role
    switch (currentRole) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'lecturer':
        return <Navigate to="/lecturer/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

// Role-based redirect component
const RoleRedirect: React.FC = () => {
  const currentRole = AuthController.getCurrentRole();

  switch (currentRole) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'lecturer':
      return <Navigate to="/lecturer/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize authentication state on app load
    AuthController.initializeAuth();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginView />} />
          
          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboardView />} />
            <Route path="attendance" element={<StudentAttendanceView />} />
            <Route path="schedule" element={<StudentScheduleView />} />
            <Route path="announcements" element={<StudentAnnouncementView />} />
            <Route path="classes" element={<StudentClassesView />} />
            <Route path="courses" element={<StudentCoursesView />} />
            <Route path="tuition-fee" element={<StudentTuitionFeeView />} />
            <Route path="profile" element={<StudentProfileView />} />
          </Route>

          {/* Lecturer Routes */}
          <Route path="/lecturer" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LecturerDashboardView />} />
            <Route path="attendance" element={<LecturerAttendanceView />} />
            <Route path="schedule" element={<LecturerScheduleView />} />
            <Route path="announcements" element={<LecturerAnnouncementView />} />
            <Route path="classes" element={<LecturerClassesView />} />
            <Route path="courses" element={<LecturerCoursesView />} />
            <Route path="profile" element={<LecturerProfileView />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboardView />} />
            <Route path="accounts" element={<AdminAccountsView />} />
            <Route path="students" element={<AdminStudentsView />} />
            <Route path="lecturers" element={<AdminLecturersView />} />
            <Route path="courses" element={<AdminCoursesView />} />
            <Route path="classes" element={<AdminClassesView />} />
            <Route path="enrollment" element={<AdminEnrollmentView />} />
            <Route path="announcements" element={<AdminAnnouncementView />} />
            <Route path="reports" element={<AdminAttendanceReportsView />} />
            <Route path="settings" element={<AdminSettingsView />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 