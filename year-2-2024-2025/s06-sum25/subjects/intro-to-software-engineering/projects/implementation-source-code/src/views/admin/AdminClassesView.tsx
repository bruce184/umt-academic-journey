import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Calendar,
  MapPin,
  Eye,
  UserCheck
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface ClassSection {
  id: string;
  classId: string;
  courseName: string;
  courseCode: string;
  lecturer: string;
  lecturerId: string;
  semester: 'Fall' | 'Spring' | 'Summer';
  year: number;
  maxEnrollment: number;
  currentEnrollment: number;
  room: string;
  schedule: string;
  status: 'active' | 'inactive' | 'full';
  department: string;
  credits: number;
}

const AdminClassesView: React.FC = () => {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    classId: '',
    courseName: '',
    courseCode: '',
    lecturer: '',
    lecturerId: '',
    semester: 'Fall' as 'Fall' | 'Spring' | 'Summer',
    year: new Date().getFullYear(),
    maxEnrollment: 30,
    room: '',
    schedule: '',
    department: '',
    credits: 3
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    // Mock classes data
    const mockClasses: ClassSection[] = [
      {
        id: '1',
        classId: 'CS101-A101',
        courseName: 'Introduction to Computer Science',
        courseCode: 'CS101',
        lecturer: 'Dr. John Smith',
        lecturerId: 'L001',
        semester: 'Fall',
        year: 2024,
        maxEnrollment: 40,
        currentEnrollment: 35,
        room: 'Room 101',
        schedule: 'Mon, Wed, Fri 9:00 AM - 10:30 AM',
        status: 'active',
        department: 'Computer Science',
        credits: 3
      },
      {
        id: '2',
        classId: 'CS101-A102',
        courseName: 'Introduction to Computer Science',
        courseCode: 'CS101',
        lecturer: 'Dr. Jane Doe',
        lecturerId: 'L002',
        semester: 'Fall',
        year: 2024,
        maxEnrollment: 35,
        currentEnrollment: 35,
        room: 'Room 102',
        schedule: 'Mon, Wed, Fri 11:00 AM - 12:30 PM',
        status: 'full',
        department: 'Computer Science',
        credits: 3
      },
      {
        id: '3',
        classId: 'CS201-B201',
        courseName: 'Data Structures and Algorithms',
        courseCode: 'CS201',
        lecturer: 'Dr. Mike Johnson',
        lecturerId: 'L003',
        semester: 'Spring',
        year: 2024,
        maxEnrollment: 30,
        currentEnrollment: 25,
        room: 'Room 201',
        schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
        status: 'active',
        department: 'Computer Science',
        credits: 4
      },
      {
        id: '4',
        classId: 'MATH101-C101',
        courseName: 'Calculus I',
        courseCode: 'MATH101',
        lecturer: 'Dr. Sarah Wilson',
        lecturerId: 'L004',
        semester: 'Fall',
        year: 2024,
        maxEnrollment: 50,
        currentEnrollment: 45,
        room: 'Room 301',
        schedule: 'Mon, Wed, Fri 1:00 PM - 2:30 PM',
        status: 'active',
        department: 'Mathematics',
        credits: 4
      }
    ];
    setClasses(mockClasses);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'full':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEnrollmentPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.classId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || cls.semester === semesterFilter;
    const matchesDepartment = departmentFilter === 'all' || cls.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    return matchesSearch && matchesSemester && matchesDepartment && matchesStatus;
  });

  const handleCreateClass = () => {
    if (!createForm.classId || !createForm.courseName || !createForm.lecturer) {
      alert('Please fill in all required fields');
      return;
    }

    const newClass: ClassSection = {
      id: Date.now().toString(),
      classId: createForm.classId,
      courseName: createForm.courseName,
      courseCode: createForm.courseCode,
      lecturer: createForm.lecturer,
      lecturerId: createForm.lecturerId,
      semester: createForm.semester,
      year: createForm.year,
      maxEnrollment: createForm.maxEnrollment,
      currentEnrollment: 0,
      room: createForm.room,
      schedule: createForm.schedule,
      status: 'active',
      department: createForm.department,
      credits: createForm.credits
    };

    setClasses(prev => [newClass, ...prev]);
    
    // Reset form
    setCreateForm({
      classId: '',
      courseName: '',
      courseCode: '',
      lecturer: '',
      lecturerId: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
      maxEnrollment: 30,
      room: '',
      schedule: '',
      department: '',
      credits: 3
    });
    
    setShowCreateModal(false);
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class section?')) {
      setClasses(prev => prev.filter(cls => cls.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'full') => {
    setClasses(prev => 
      prev.map(cls => 
        cls.id === id ? { ...cls, status: newStatus } : cls
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Management</h1>
            <p className="text-gray-600">
              Create and manage class sections with enrollment tracking and lecturer assignments.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class Section
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
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
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Full Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(c => c.status === 'full').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0)}
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
              <option value="full">Full</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lecturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
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
              {filteredClasses.map((cls) => {
                const enrollmentPercentage = getEnrollmentPercentage(cls.currentEnrollment, cls.maxEnrollment);
                return (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cls.classId}</div>
                        <div className="text-sm text-gray-500">{cls.courseCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cls.courseName}</div>
                        <div className="text-sm text-gray-500">{cls.department} • {cls.credits} credits</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cls.lecturer}</div>
                      <div className="text-sm text-gray-500">ID: {cls.lecturerId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cls.schedule}</div>
                      <div className="text-sm text-gray-500">{cls.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cls.currentEnrollment}/{cls.maxEnrollment}
                      </div>
                      <div className={`text-sm ${getEnrollmentColor(enrollmentPercentage)}`}>
                        {enrollmentPercentage}% full
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={cls.status}
                        onChange={(e) => handleStatusChange(cls.id, e.target.value as 'active' | 'inactive' | 'full')}
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(cls.status)}`}
                        title="Change class status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="full">Full</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedClass(cls)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit class"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete class"
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

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Class Section</h3>
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
                    Class ID *
                  </label>
                  <input
                    type="text"
                    value={createForm.classId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., CS101-A101"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecturer *
                  </label>
                  <input
                    type="text"
                    value={createForm.lecturer}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, lecturer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecturer ID
                  </label>
                  <input
                    type="text"
                    value={createForm.lecturerId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, lecturerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="L001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room
                  </label>
                  <input
                    type="text"
                    value={createForm.room}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Room 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={createForm.schedule}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, schedule: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Mon, Wed, Fri 9:00 AM - 10:30 AM"
                  />
                </div>
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
                onClick={handleCreateClass}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Class Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Class Section Details</h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Class ID</p>
                  <p className="text-sm text-gray-600">{selectedClass.classId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Course Code</p>
                  <p className="text-sm text-gray-600">{selectedClass.courseCode}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Course Name</p>
                <p className="text-sm text-gray-600">{selectedClass.courseName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Lecturer</p>
                  <p className="text-sm text-gray-600">{selectedClass.lecturer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lecturer ID</p>
                  <p className="text-sm text-gray-600">{selectedClass.lecturerId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{selectedClass.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Credits</p>
                  <p className="text-sm text-gray-600">{selectedClass.credits}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Semester</p>
                  <p className="text-sm text-gray-600">{selectedClass.semester} {selectedClass.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">{selectedClass.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Room</p>
                  <p className="text-sm text-gray-600">{selectedClass.room}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule</p>
                  <p className="text-sm text-gray-600">{selectedClass.schedule}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Enrollment</p>
                <p className="text-sm text-gray-600">
                  {selectedClass.currentEnrollment}/{selectedClass.maxEnrollment} 
                  ({getEnrollmentPercentage(selectedClass.currentEnrollment, selectedClass.maxEnrollment)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassesView;