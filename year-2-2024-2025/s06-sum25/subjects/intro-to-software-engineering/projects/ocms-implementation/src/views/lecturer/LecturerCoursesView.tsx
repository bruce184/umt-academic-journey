import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Course, Class } from '../../models';

const LecturerCoursesView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load courses taught by this lecturer
    const lecturerCourses = CourseController.getCoursesByLecturer(currentUser?.userId || '');
    setCourses(lecturerCourses);

    // Load classes for these courses
    const allClasses = CourseController.getAllClasses();
    setClasses(allClasses);
    setLoading(false);
  };

  const getClassesForCourse = (courseCode: string) => {
    return classes.filter(cls => cls.courseCode === courseCode);
  };

  const getCourseStats = (courseCode: string) => {
    const courseClasses = getClassesForCourse(courseCode);
    const totalStudents = courseClasses.reduce((sum, cls) => sum + cls.currentEnrollment, 0);
    const totalClasses = courseClasses.length;
    
    return { totalStudents, totalClasses };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'L':
        return 'bg-blue-100 text-blue-800';
      case 'P':
        return 'bg-green-100 text-green-800';
      case 'T':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'L':
        return 'Lecture';
      case 'P':
        return 'Practical';
      case 'T':
        return 'Theory';
      default:
        return 'Unknown';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || course.courseType === typeFilter;
    return matchesSearch && matchesType;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">
              Manage and view the courses you are teaching.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
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
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by course type"
            >
              <option value="all">All Types</option>
              <option value="L">Lecture</option>
              <option value="P">Practical</option>
              <option value="T">Theory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const stats = getCourseStats(course.courseCode);
          const courseClasses = getClassesForCourse(course.courseCode);
          
          return (
            <div key={course.courseCode} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{course.courseCode}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(course.courseType)}`}>
                      {getTypeLabel(course.courseType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
                    <div className="text-xs text-gray-500">Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.credit} Credits</span>
                  </div>
                </div>

                {courseClasses.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Active Classes</h4>
                    <div className="space-y-2">
                      {courseClasses.slice(0, 2).map((cls) => (
                        <div key={cls.classId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{cls.classId}</span>
                          <span className="text-gray-500">{cls.currentEnrollment} students</span>
                        </div>
                      ))}
                      {courseClasses.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{courseClasses.length - 2} more classes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      View Classes
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                      Materials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedCourse.courseName}</h4>
                <p className="text-sm text-gray-500">{selectedCourse.courseCode}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getTypeColor(selectedCourse.courseType)}`}>
                  {getTypeLabel(selectedCourse.courseType)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Credits</p>
                  <p className="text-sm text-gray-600">{selectedCourse.credit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-sm text-gray-600">{getTypeLabel(selectedCourse.courseType)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Classes</h4>
                <div className="space-y-2">
                  {getClassesForCourse(selectedCourse.courseCode).map((cls) => (
                    <div key={cls.classId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{cls.classId}</span>
                      <span className="text-sm text-gray-500">{cls.currentEnrollment} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You are not assigned to any courses yet.'
            }
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add Course
          </button>
        </div>
      )}
    </div>
  );
};

export default LecturerCoursesView;