import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Users,
  Clock,
  Eye
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  semester: 'Fall' | 'Spring' | 'Summer';
  year: number;
  maxEnrollment: number;
  currentEnrollment: number;
  lecturer: string;
  status: 'active' | 'inactive' | 'completed';
  prerequisites: string[];
}

const AdminCoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 3,
    department: '',
    semester: 'Fall' as 'Fall' | 'Spring' | 'Summer',
    year: new Date().getFullYear(),
    maxEnrollment: 30,
    lecturer: '',
    status: 'active' as 'active' | 'inactive' | 'completed',
    prerequisites: [] as string[]
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    // Mock courses data
    const mockCourses: Course[] = [
      {
        id: '1',
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming.',
        credits: 3,
        department: 'Computer Science',
        semester: 'Fall',
        year: 2024,
        maxEnrollment: 40,
        currentEnrollment: 35,
        lecturer: 'Dr. John Smith',
        status: 'active',
        prerequisites: []
      },
      {
        id: '2',
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm analysis.',
        credits: 4,
        department: 'Computer Science',
        semester: 'Spring',
        year: 2024,
        maxEnrollment: 30,
        currentEnrollment: 28,
        lecturer: 'Dr. Jane Doe',
        status: 'active',
        prerequisites: ['CS101']
      },
      {
        id: '3',
        courseCode: 'MATH101',
        courseName: 'Calculus I',
        description: 'Introduction to differential calculus.',
        credits: 4,
        department: 'Mathematics',
        semester: 'Fall',
        year: 2024,
        maxEnrollment: 50,
        currentEnrollment: 45,
        lecturer: 'Dr. Mike Johnson',
        status: 'active',
        prerequisites: []
      },
      {
        id: '4',
        courseCode: 'PHYS101',
        courseName: 'Physics I',
        description: 'Classical mechanics and thermodynamics.',
        credits: 4,
        department: 'Physics',
        semester: 'Spring',
        year: 2024,
        maxEnrollment: 35,
        currentEnrollment: 32,
        lecturer: 'Dr. Sarah Wilson',
        status: 'active',
        prerequisites: ['MATH101']
      }
    ];
    setCourses(mockCourses);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEnrollmentPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter;
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesSemester && matchesDepartment && matchesStatus;
  });

  const handleCreateCourse = () => {
    if (!createForm.courseCode || !createForm.courseName || !createForm.department) {
      alert('Please fill in all required fields');
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      courseCode: createForm.courseCode,
      courseName: createForm.courseName,
      description: createForm.description,
      credits: createForm.credits,
      department: createForm.department,
      semester: createForm.semester,
      year: createForm.year,
      maxEnrollment: createForm.maxEnrollment,
      currentEnrollment: 0,
      lecturer: createForm.lecturer,
      status: createForm.status,
      prerequisites: createForm.prerequisites
    };

    setCourses(prev => [newCourse, ...prev]);
    
    // Reset form
    setCreateForm({
      courseCode: '',
      courseName: '',
      description: '',
      credits: 3,
      department: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
      maxEnrollment: 30,
      lecturer: '',
      status: 'active',
      prerequisites: []
    });
    
    setShowCreateModal(false);
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(course => course.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'completed') => {
    setCourses(prev => 
      prev.map(course => 
        course.id === id ? { ...course, status: newStatus } : course
      )
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600">
              Add, edit, and manage course offerings and curriculum.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.currentEnrollment, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Semester</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.semester === 'Fall' && c.year === 2024).length}
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
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              title="Filter by semester"
            >
              <option value="all">All Semesters</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              title="Filter by department"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => {
                const enrollmentPercentage = getEnrollmentPercentage(course.currentEnrollment, course.maxEnrollment);
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                        <div className="text-sm text-gray-500">{course.courseCode} • {course.credits} credits</div>
                        <div className="text-sm text-gray-500">Lecturer: {course.lecturer}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.semester} {course.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.currentEnrollment}/{course.maxEnrollment}
                      </div>
                      <div className={`text-sm ${getEnrollmentColor(enrollmentPercentage)}`}>
                        {enrollmentPercentage}% full
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course.id, e.target.value as 'active' | 'inactive' | 'completed')}
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(course.status)}`}
                        title="Change course status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={createForm.courseCode}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, courseCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.courseName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, courseName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Introduction to Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credits
                  </label>
                                       <input
                       type="number"
                       value={createForm.credits}
                       onChange={(e) => setCreateForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                       min="1"
                       max="6"
                       title="Number of credits"
                       placeholder="3"
                     />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Enrollment
                  </label>
                                       <input
                       type="number"
                       value={createForm.maxEnrollment}
                       onChange={(e) => setCreateForm(prev => ({ ...prev, maxEnrollment: parseInt(e.target.value) }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                       min="1"
                       title="Maximum enrollment capacity"
                       placeholder="30"
                     />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={createForm.semester}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, semester: e.target.value as 'Fall' | 'Spring' | 'Summer' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    title="Select semester"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                                     <input
                     type="number"
                     value={createForm.year}
                     onChange={(e) => setCreateForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                     min={new Date().getFullYear()}
                     title="Academic year"
                     placeholder="2024"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'completed' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    title="Select course status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecturer
                </label>
                <input
                  type="text"
                  value={createForm.lecturer}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, lecturer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Dr. John Smith"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Course Code</p>
                  <p className="text-sm text-gray-600">{selectedCourse.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Course Name</p>
                  <p className="text-sm text-gray-600">{selectedCourse.courseName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Description</p>
                <p className="text-sm text-gray-600">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{selectedCourse.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Credits</p>
                  <p className="text-sm text-gray-600">{selectedCourse.credits}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Semester</p>
                  <p className="text-sm text-gray-600">{selectedCourse.semester} {selectedCourse.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lecturer</p>
                  <p className="text-sm text-gray-600">{selectedCourse.lecturer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enrollment</p>
                  <p className="text-sm text-gray-600">
                    {selectedCourse.currentEnrollment}/{selectedCourse.maxEnrollment} 
                    ({getEnrollmentPercentage(selectedCourse.currentEnrollment, selectedCourse.maxEnrollment)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">{selectedCourse.status}</p>
                </div>
              </div>

              {selectedCourse.prerequisites.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Prerequisites</p>
                  <p className="text-sm text-gray-600">{selectedCourse.prerequisites.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesView;