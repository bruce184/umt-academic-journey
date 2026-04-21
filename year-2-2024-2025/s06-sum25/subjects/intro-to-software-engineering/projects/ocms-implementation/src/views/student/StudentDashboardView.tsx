import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, FileText, Bell } from 'lucide-react';
import { CourseController } from '../../controllers/CourseController';
import { AuthController } from '../../controllers/AuthController';
import { Course, Class } from '../../models';

// StudentDashboardView - Giao diện dashboard cho student (View trong MVC)
const StudentDashboardView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalClasses: 0,
    upcomingClasses: 0,
    completedAssignments: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      // Load courses for current user
      const userCourses = CourseController.getCoursesForCurrentUser();
      setCourses(userCourses);

      // Load classes for current user
      const userClasses = CourseController.getClassesForCurrentUser();
      setClasses(userClasses);

      // Calculate stats
      const upcomingClasses = userClasses.length; // Simplified for now

      setStats({
        totalCourses: userCourses.length,
        totalClasses: userClasses.length,
        upcomingClasses,
        completedAssignments: Math.floor(Math.random() * 10) + 5 // Mock data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for day conversion (if needed in future)
  // const getDayNumber = (day: string): number => {
  //   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  //   return days.indexOf(day);
  // };

  const currentUser = AuthController.getCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-lg p-6 text-black">
        <h1 className="text-2xl font-bold">
          Welcome back, {currentUser?.fullName}!
        </h1>
        <p className="text-black mt-1">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
        </div>
        <div className="p-6">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses enrolled</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by enrolling in your first course.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.courseCode} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{course.courseName}</h3>
                      <p className="text-sm text-gray-500">{course.courseCode} • {course.credit} credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Type: {course.courseType}
                    </p>
                    <p className="text-xs text-gray-500">Course</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        </div>
        <div className="p-6">
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes today</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enjoy your free time!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.slice(0, 3).map((cls) => (
                <div key={cls.classId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{cls.courseName}</h3>
                      <p className="text-sm text-gray-500">
                        {cls.semesterCode} {cls.year} • {cls.currentEnrollment}/{cls.capacity} students
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{cls.semesterCode} {cls.year}</p>
                    <p className="text-xs text-gray-500">{cls.currentEnrollment}/{cls.capacity} students</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Schedule</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">My Courses</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Assignments</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="h-6 w-6 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Notifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView; 