import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Bell, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Class, Course } from '../../models';

const LecturerDashboardView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load classes taught by this lecturer
    const lecturerClasses = CourseController.getClassesByLecturer(currentUser?.userId || '');
    setClasses(lecturerClasses);

    // Load courses taught by this lecturer
    const lecturerCourses = CourseController.getCoursesByLecturer(currentUser?.userId || '');
    setCourses(lecturerCourses);

    setLoading(false);
  };

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return classes.filter(cls => {
      // Mock filter - in real app would check actual schedule
      return cls.courseName.includes('Computer Science') || cls.courseName.includes('Data Structures');
    });
  };

  const getRecentAnnouncements = () => {
    return [
      {
        id: '1',
        title: 'Assignment 1 Due Date Extended',
        content: 'The due date for Assignment 1 has been extended to Friday.',
        postedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Class Cancelled - Tomorrow',
        content: 'Tomorrow\'s class will be cancelled due to faculty meeting.',
        postedAt: '2024-01-14T14:30:00Z'
      }
    ];
  };

  const getAttendanceStats = () => {
    return {
      totalStudents: 45,
      presentToday: 38,
      absentToday: 5,
      lateToday: 2
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = getAttendanceStats();
  const todayClasses = getTodayClasses();
  const announcements = getRecentAnnouncements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lecturer Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser?.fullName}. Here's your teaching overview.
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((stats.presentToday / stats.totalStudents) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes and Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          </div>
          <div className="p-6">
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes today</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enjoy your free time!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div key={cls.classId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{cls.courseName}</h3>
                        <p className="text-sm text-gray-500">
                          {cls.classId} • {cls.currentEnrollment} students
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">9:00 AM</p>
                      <p className="text-sm text-gray-500">Room 101</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
          </div>
          <div className="p-6">
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Check back later for updates
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(announcement.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Attendance Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.lateToday}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboardView; 