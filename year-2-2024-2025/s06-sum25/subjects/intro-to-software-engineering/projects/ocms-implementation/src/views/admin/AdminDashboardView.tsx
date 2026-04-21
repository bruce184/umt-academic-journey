import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Class, Course } from '../../models';

const AdminDashboardView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalRevenue: 0,
    enrollmentRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load all courses and classes for stats
    const allCourses = CourseController.getAllCourses();
    const allClasses = CourseController.getAllClasses();

    // Mock statistics - in real app would come from API
    setStats({
      totalStudents: 1250,
      totalLecturers: 45,
      totalCourses: allCourses.length,
      totalClasses: allClasses.length,
      totalRevenue: 1250000,
      enrollmentRate: 87
    });

    setLoading(false);
  };

  const getRecentActivities = () => {
    return [
      {
        id: '1',
        type: 'enrollment',
        message: 'New student enrolled in Computer Science',
        time: '2 hours ago'
      },
      {
        id: '2',
        type: 'course',
        message: 'New course "Advanced Algorithms" added',
        time: '4 hours ago'
      },
      {
        id: '3',
        type: 'payment',
        message: 'Tuition payment received from Student ID 1001',
        time: '6 hours ago'
      },
      {
        id: '4',
        type: 'attendance',
        message: 'Attendance report generated for CS101',
        time: '1 day ago'
      }
    ];
  };

  const getSystemHealth = () => {
    return {
      database: 'healthy',
      api: 'healthy',
      storage: '85%',
      uptime: '99.9%'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activities = getRecentActivities();
  const systemHealth = getSystemHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser?.fullName}. Here's your system overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lecturers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLecturers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Rate */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Enrollment Rate</h2>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.enrollmentRate}%</div>
            <p className="text-sm text-gray-600">Current semester enrollment</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.enrollmentRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">{systemHealth.database}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">{systemHealth.api}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium text-gray-900">{systemHealth.storage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">{systemHealth.uptime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Add Student</h3>
                <p className="text-xs text-gray-500">Register new student</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <GraduationCap className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Add Lecturer</h3>
                <p className="text-xs text-gray-500">Register new lecturer</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Create Course</h3>
                <p className="text-xs text-gray-500">Add new course</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
                <p className="text-xs text-gray-500">Generate reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Distribution */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Class Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(stats.totalClasses * 0.4)}</div>
              <p className="text-sm text-gray-600">Computer Science</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(stats.totalClasses * 0.35)}</div>
              <p className="text-sm text-gray-600">Engineering</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(stats.totalClasses * 0.25)}</div>
              <p className="text-sm text-gray-600">Business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;