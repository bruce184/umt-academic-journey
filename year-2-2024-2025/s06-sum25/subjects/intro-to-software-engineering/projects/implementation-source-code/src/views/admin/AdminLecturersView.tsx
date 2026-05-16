import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  Eye,
  BookOpen,
  Award
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface Lecturer {
  id: string;
  lecturerId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  qualification: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  coursesTeaching: number;
  totalStudents: number;
  office: string;
  officeHours: string;
}

const AdminLecturersView: React.FC = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    lecturerId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    qualification: '',
    office: '',
    officeHours: ''
  });

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = () => {
    // Mock lecturers data
    const mockLecturers: Lecturer[] = [
      {
        id: '1',
        lecturerId: 'L001',
        fullName: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        phone: '+1-555-0101',
        department: 'Computer Science',
        specialization: 'Artificial Intelligence',
        qualification: 'Ph.D. Computer Science',
        hireDate: '2020-09-01',
        status: 'active',
        coursesTeaching: 3,
        totalStudents: 120,
        office: 'Room 201, Building A',
        officeHours: 'Mon, Wed 2:00 PM - 4:00 PM'
      },
      {
        id: '2',
        lecturerId: 'L002',
        fullName: 'Dr. Jane Doe',
        email: 'jane.doe@university.edu',
        phone: '+1-555-0102',
        department: 'Computer Science',
        specialization: 'Software Engineering',
        qualification: 'Ph.D. Software Engineering',
        hireDate: '2019-03-15',
        status: 'active',
        coursesTeaching: 2,
        totalStudents: 85,
        office: 'Room 205, Building A',
        officeHours: 'Tue, Thu 1:00 PM - 3:00 PM'
      },
      {
        id: '3',
        lecturerId: 'L003',
        fullName: 'Dr. Mike Johnson',
        email: 'mike.johnson@university.edu',
        phone: '+1-555-0103',
        department: 'Mathematics',
        specialization: 'Applied Mathematics',
        qualification: 'Ph.D. Mathematics',
        hireDate: '2021-01-10',
        status: 'active',
        coursesTeaching: 4,
        totalStudents: 150,
        office: 'Room 301, Building B',
        officeHours: 'Mon, Fri 10:00 AM - 12:00 PM'
      },
      {
        id: '4',
        lecturerId: 'L004',
        fullName: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@university.edu',
        phone: '+1-555-0104',
        department: 'Physics',
        specialization: 'Quantum Physics',
        qualification: 'Ph.D. Physics',
        hireDate: '2018-08-20',
        status: 'on_leave',
        coursesTeaching: 0,
        totalStudents: 0,
        office: 'Room 401, Building C',
        officeHours: 'Currently on leave'
      }
    ];
    setLecturers(mockLecturers);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'on_leave':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Unknown';
    }
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = lecturer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecturer.lecturerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecturer.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || lecturer.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || lecturer.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleCreateLecturer = () => {
    if (!createForm.lecturerId || !createForm.fullName || !createForm.email || !createForm.department) {
      alert('Please fill in all required fields');
      return;
    }

    const newLecturer: Lecturer = {
      id: Date.now().toString(),
      lecturerId: createForm.lecturerId,
      fullName: createForm.fullName,
      email: createForm.email,
      phone: createForm.phone,
      department: createForm.department,
      specialization: createForm.specialization,
      qualification: createForm.qualification,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      coursesTeaching: 0,
      totalStudents: 0,
      office: createForm.office,
      officeHours: createForm.officeHours
    };

    setLecturers(prev => [newLecturer, ...prev]);
    
    // Reset form
    setCreateForm({
      lecturerId: '',
      fullName: '',
      email: '',
      phone: '',
      department: '',
      specialization: '',
      qualification: '',
      office: '',
      officeHours: ''
    });
    
    setShowCreateModal(false);
  };

  const handleDeleteLecturer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lecturer?')) {
      setLecturers(prev => prev.filter(lecturer => lecturer.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'on_leave') => {
    setLecturers(prev => 
      prev.map(lecturer => 
        lecturer.id === id ? { ...lecturer, status: newStatus } : lecturer
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lecturer Management</h1>
            <p className="text-gray-600">
              Add, edit, and manage lecturer accounts with department information.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lecturer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lecturers</p>
              <p className="text-2xl font-bold text-gray-900">{lecturers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Lecturers</p>
              <p className="text-2xl font-bold text-gray-900">
                {lecturers.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {lecturers.reduce((sum, lecturer) => sum + lecturer.coursesTeaching, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {lecturers.reduce((sum, lecturer) => sum + lecturer.totalStudents, 0)}
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
                placeholder="Search lecturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
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
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lecturers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lecturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teaching Load
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
              {filteredLecturers.map((lecturer) => (
                <tr key={lecturer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lecturer.fullName}</div>
                      <div className="text-sm text-gray-500">ID: {lecturer.lecturerId}</div>
                      <div className="text-sm text-gray-500">{lecturer.qualification}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lecturer.email}</div>
                    <div className="text-sm text-gray-500">{lecturer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lecturer.department}</div>
                    <div className="text-sm text-gray-500">{lecturer.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lecturer.coursesTeaching} courses</div>
                    <div className="text-sm text-gray-500">{lecturer.totalStudents} students</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lecturer.status}
                      onChange={(e) => handleStatusChange(lecturer.id, e.target.value as 'active' | 'inactive' | 'on_leave')}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(lecturer.status)}`}
                      title="Change lecturer status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLecturer(lecturer)}
                        className="text-purple-600 hover:text-purple-900"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit lecturer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLecturer(lecturer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete lecturer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lecturer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Lecturer</h3>
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
                    Lecturer ID *
                  </label>
                  <input
                    type="text"
                    value={createForm.lecturerId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, lecturerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., L001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Dr. John Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="john.smith@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="+1-555-0101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={createForm.specialization}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Artificial Intelligence"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  value={createForm.qualification}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, qualification: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ph.D. Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office
                  </label>
                  <input
                    type="text"
                    value={createForm.office}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, office: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Room 201, Building A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    value={createForm.officeHours}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, officeHours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Mon, Wed 2:00 PM - 4:00 PM"
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
                onClick={handleCreateLecturer}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Lecturer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecturer Details Modal */}
      {selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lecturer Details</h3>
              <button
                onClick={() => setSelectedLecturer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Lecturer ID</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.lecturerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Full Name</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.fullName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Specialization</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.specialization}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Qualification</p>
                <p className="text-sm text-gray-600">{selectedLecturer.qualification}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hire Date</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.hireDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">{getStatusLabel(selectedLecturer.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Courses Teaching</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.coursesTeaching}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Students</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.totalStudents}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Office</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.office}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Office Hours</p>
                  <p className="text-sm text-gray-600">{selectedLecturer.officeHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLecturersView;