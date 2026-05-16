import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Class, Course } from '../../models';

const LecturerClassesView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load classes taught by this lecturer
    const lecturerClasses = CourseController.getClassesByLecturer(currentUser?.userId || '');
    setClasses(lecturerClasses);

    // Load courses for reference
    const allCourses = CourseController.getAllCourses();
    setCourses(allCourses);
    setLoading(false);
  };

  const getCourseForClass = (courseCode: string) => {
    return courses.find(course => course.courseCode === courseCode);
  };

  const getEnrollmentPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredClasses = classes.filter(cls => {
    const course = getCourseForClass(cls.courseCode);
    const matchesSearch = cls.classId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course?.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'all' || cls.courseCode === courseFilter;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Classes</h1>
            <p className="text-gray-600">
              Manage and view the classes you are teaching.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0)}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {new Set(classes.map(cls => cls.courseCode)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.length > 0 
                  ? Math.round(classes.reduce((sum, cls) => sum + (cls.currentEnrollment / cls.capacity) * 100, 0) / classes.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by course"
            >
              <option value="all">All Courses</option>
              {Array.from(new Set(classes.map(cls => cls.courseCode))).map(courseCode => {
                const course = getCourseForClass(courseCode);
                return (
                  <option key={courseCode} value={courseCode}>
                    {course?.courseName || courseCode}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const course = getCourseForClass(cls.courseCode);
          const enrollmentPercentage = getEnrollmentPercentage(cls.currentEnrollment, cls.capacity);
          
          return (
            <div key={cls.classId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {cls.classId}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{course?.courseName || cls.courseName}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cls.semesterCode} {cls.year}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit class"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{cls.currentEnrollment}</div>
                    <div className="text-xs text-gray-500">Enrolled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{cls.capacity}</div>
                    <div className="text-xs text-gray-500">Capacity</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Enrollment</span>
                    <span className={`text-xs font-medium ${getEnrollmentColor(enrollmentPercentage)}`}>
                      {enrollmentPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        enrollmentPercentage >= 90 ? 'bg-red-600' :
                        enrollmentPercentage >= 75 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Schedule: TBD</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Room: TBD</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      Manage Class
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                      Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Class Details</h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedClass.classId}</h4>
                <p className="text-sm text-gray-500">{getCourseForClass(selectedClass.courseCode)?.courseName}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 bg-blue-100 text-blue-800">
                  {selectedClass.semesterCode} {selectedClass.year}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enrollment</p>
                  <p className="text-sm text-gray-600">{selectedClass.currentEnrollment} / {selectedClass.capacity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Enrollment Rate</p>
                  <p className="text-sm text-gray-600">{getEnrollmentPercentage(selectedClass.currentEnrollment, selectedClass.capacity)}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                    Take Attendance
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    View Students
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    Upload Materials
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    Create Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || courseFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You are not assigned to any classes yet.'
            }
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create Class
          </button>
        </div>
      )}
    </div>
  );
};

export default LecturerClassesView;