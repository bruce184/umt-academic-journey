import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Eye,
  Calendar,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  major: string;
  year: number;
  gpa: number;
}

interface Class {
  id: string;
  classId: string;
  courseName: string;
  courseCode: string;
  lecturer: string;
  semester: string;
  year: number;
  maxEnrollment: number;
  currentEnrollment: number;
  department: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'dropped' | 'waitlisted';
  grade?: string;
}

const AdminEnrollmentView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock students data
    const mockStudents: Student[] = [
      { id: '1', studentId: '2024001', fullName: 'John Doe', email: 'john.doe@student.edu', major: 'Computer Science', year: 2, gpa: 3.8 },
      { id: '2', studentId: '2024002', fullName: 'Jane Smith', email: 'jane.smith@student.edu', major: 'Mathematics', year: 3, gpa: 3.9 },
      { id: '3', studentId: '2024003', fullName: 'Mike Johnson', email: 'mike.johnson@student.edu', major: 'Physics', year: 1, gpa: 3.5 },
      { id: '4', studentId: '2024004', fullName: 'Sarah Wilson', email: 'sarah.wilson@student.edu', major: 'Computer Science', year: 4, gpa: 3.7 },
      { id: '5', studentId: '2024005', fullName: 'Tom Brown', email: 'tom.brown@student.edu', major: 'Mathematics', year: 2, gpa: 3.6 },
    ];

    // Mock classes data
    const mockClasses: Class[] = [
      { id: '1', classId: 'CS101-A101', courseName: 'Introduction to Computer Science', courseCode: 'CS101', lecturer: 'Dr. John Smith', semester: 'Fall 2024', year: 2024, maxEnrollment: 40, currentEnrollment: 35, department: 'Computer Science' },
      { id: '2', classId: 'CS201-B201', courseName: 'Data Structures and Algorithms', courseCode: 'CS201', lecturer: 'Dr. Jane Doe', semester: 'Spring 2024', year: 2024, maxEnrollment: 30, currentEnrollment: 28, department: 'Computer Science' },
      { id: '3', classId: 'MATH101-C101', courseName: 'Calculus I', courseCode: 'MATH101', lecturer: 'Dr. Mike Johnson', semester: 'Fall 2024', year: 2024, maxEnrollment: 50, currentEnrollment: 45, department: 'Mathematics' },
      { id: '4', classId: 'PHYS101-D101', courseName: 'Physics I', courseCode: 'PHYS101', lecturer: 'Dr. Sarah Wilson', semester: 'Spring 2024', year: 2024, maxEnrollment: 35, currentEnrollment: 32, department: 'Physics' },
    ];

    // Mock enrollments data
    const mockEnrollments: Enrollment[] = [
      { id: '1', studentId: '2024001', classId: 'CS101-A101', enrollmentDate: '2024-08-15', status: 'enrolled' },
      { id: '2', studentId: '2024002', classId: 'CS101-A101', enrollmentDate: '2024-08-16', status: 'enrolled' },
      { id: '3', studentId: '2024003', classId: 'MATH101-C101', enrollmentDate: '2024-08-17', status: 'enrolled' },
      { id: '4', studentId: '2024004', classId: 'CS201-B201', enrollmentDate: '2024-08-18', status: 'enrolled' },
      { id: '5', studentId: '2024005', classId: 'MATH101-C101', enrollmentDate: '2024-08-19', status: 'enrolled' },
    ];

    setStudents(mockStudents);
    setClasses(mockClasses);
    setEnrollments(mockEnrollments);
    setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'text-green-600 bg-green-100';
      case 'dropped':
        return 'text-red-600 bg-red-100';
      case 'waitlisted':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.classId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || cls.semester.includes(semesterFilter);
    const matchesDepartment = departmentFilter === 'all' || cls.department === departmentFilter;
    return matchesSearch && matchesSemester && matchesDepartment;
  });

  const getEnrolledStudents = (classId: string) => {
    return enrollments
      .filter(enrollment => enrollment.classId === classId && enrollment.status === 'enrolled')
      .map(enrollment => students.find(student => student.studentId === enrollment.studentId))
      .filter(Boolean) as Student[];
  };

  const getAvailableStudents = (classId: string) => {
    const enrolledStudentIds = enrollments
      .filter(enrollment => enrollment.classId === classId && enrollment.status === 'enrolled')
      .map(enrollment => enrollment.studentId);
    
    return students.filter(student => !enrolledStudentIds.includes(student.studentId));
  };

  const handleEnrollStudent = (studentId: string, classId: string) => {
    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      studentId,
      classId,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'enrolled'
    };

    setEnrollments(prev => [...prev, newEnrollment]);

    // Update class enrollment count
    setClasses(prev => 
      prev.map(cls => 
        cls.classId === classId 
          ? { ...cls, currentEnrollment: cls.currentEnrollment + 1 }
          : cls
      )
    );
  };

  const handleDropStudent = (studentId: string, classId: string) => {
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment.studentId === studentId && enrollment.classId === classId
          ? { ...enrollment, status: 'dropped' }
          : enrollment
      )
    );

    // Update class enrollment count
    setClasses(prev => 
      prev.map(cls => 
        cls.classId === classId 
          ? { ...cls, currentEnrollment: cls.currentEnrollment - 1 }
          : cls
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Management</h1>
            <p className="text-gray-600">
              Manage student enrollments in classes with dual-list interface.
            </p>
          </div>
          <button 
            onClick={() => setShowEnrollmentModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Enrollment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.filter(e => e.status === 'enrolled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Semester</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(c => c.semester.includes('Fall 2024')).length}
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
              <option value="Fall">Fall 2024</option>
              <option value="Spring">Spring 2024</option>
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
          </div>
        </div>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const enrollmentPercentage = getEnrollmentPercentage(cls.currentEnrollment, cls.maxEnrollment);
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedClass?.classId === cls.classId
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{cls.courseName}</h3>
                <p className="text-sm text-gray-500">{cls.classId}</p>
                <p className="text-sm text-gray-500">Lecturer: {cls.lecturer}</p>
                <p className="text-sm text-gray-500">{cls.semester}</p>
                <div className="mt-2">
                  <div className="text-sm text-gray-900">
                    {cls.currentEnrollment}/{cls.maxEnrollment} enrolled
                  </div>
                  <div className={`text-sm ${getEnrollmentColor(enrollmentPercentage)}`}>
                    {enrollmentPercentage}% full
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual List Interface */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedClass.courseName}</h2>
              <p className="text-sm text-gray-500">{selectedClass.classId} • {selectedClass.lecturer}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Enrollment</div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedClass.currentEnrollment}/{selectedClass.maxEnrollment}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Students */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Available Students</h3>
                <p className="text-sm text-gray-500">
                  {getAvailableStudents(selectedClass.classId).length} students available
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {getAvailableStudents(selectedClass.classId).map((student) => (
                  <div key={student.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-sm text-gray-500">{student.studentId} • {student.major}</div>
                        <div className="text-sm text-gray-500">Year {student.year} • GPA: {student.gpa}</div>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student.studentId, selectedClass.classId)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="Enroll student"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {getAvailableStudents(selectedClass.classId).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No available students
                  </div>
                )}
              </div>
            </div>

            {/* Enrolled Students */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Enrolled Students</h3>
                <p className="text-sm text-gray-500">
                  {getEnrolledStudents(selectedClass.classId).length} students enrolled
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {getEnrolledStudents(selectedClass.classId).map((student) => (
                  <div key={student.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-sm text-gray-500">{student.studentId} • {student.major}</div>
                        <div className="text-sm text-gray-500">Year {student.year} • GPA: {student.gpa}</div>
                      </div>
                      <button
                        onClick={() => handleDropStudent(student.studentId, selectedClass.classId)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Drop student"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {getEnrolledStudents(selectedClass.classId).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No enrolled students
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment History */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Enrollment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments
                  .filter(enrollment => enrollment.classId === selectedClass.classId)
                  .map((enrollment) => {
                    const student = students.find(s => s.studentId === enrollment.studentId);
                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student?.fullName}</div>
                            <div className="text-sm text-gray-500">{student?.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollment.enrollmentDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollment.grade || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollmentView;