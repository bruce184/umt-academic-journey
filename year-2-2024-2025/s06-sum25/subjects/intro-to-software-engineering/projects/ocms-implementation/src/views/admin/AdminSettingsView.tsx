import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Calendar,
  Building,
  Shield,
  Database,
  Bell,
  Mail,
  Lock,
  Users,
  Globe,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface SystemSettings {
  academicYear: string;
  currentSemester: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  maxEnrollmentPerStudent: number;
  maxCreditsPerSemester: number;
  attendanceThreshold: number;
  gpaRequirement: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  backupFrequency: string;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  email: string;
  status: 'active' | 'inactive';
}

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    academicYear: '2024-2025',
    currentSemester: 'Fall 2024',
    enrollmentStartDate: '2024-08-01',
    enrollmentEndDate: '2024-09-15',
    maxEnrollmentPerStudent: 6,
    maxCreditsPerSemester: 18,
    attendanceThreshold: 75,
    gpaRequirement: 2.0,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock departments data
    const mockDepartments: Department[] = [
      { id: '1', name: 'Computer Science', code: 'CS', head: 'Dr. John Smith', email: 'cs@university.edu', status: 'active' },
      { id: '2', name: 'Mathematics', code: 'MATH', head: 'Dr. Jane Doe', email: 'math@university.edu', status: 'active' },
      { id: '3', name: 'Physics', code: 'PHYS', head: 'Dr. Mike Johnson', email: 'physics@university.edu', status: 'active' },
      { id: '4', name: 'Chemistry', code: 'CHEM', head: 'Dr. Sarah Wilson', email: 'chemistry@university.edu', status: 'inactive' },
    ];

    // Mock semesters data
    const mockSemesters: Semester[] = [
      { id: '1', name: 'Fall 2024', startDate: '2024-09-01', endDate: '2024-12-15', status: 'active' },
      { id: '2', name: 'Spring 2025', startDate: '2025-01-15', endDate: '2025-05-01', status: 'upcoming' },
      { id: '3', name: 'Summer 2025', startDate: '2025-06-01', endDate: '2025-08-15', status: 'upcoming' },
      { id: '4', name: 'Fall 2023', startDate: '2023-09-01', endDate: '2023-12-15', status: 'completed' },
    ];

    setDepartments(mockDepartments);
    setSemesters(mockSemesters);
    setLoading(false);
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    // Simulate data export
    alert('Data export functionality would be implemented here');
  };

  const handleImportData = () => {
    // Simulate data import
    alert('Data import functionality would be implemented here');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'upcoming':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">
              Configure system parameters, academic settings, and administrative preferences.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleImportData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Save className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'general', name: 'General', icon: Settings },
              { id: 'academic', name: 'Academic', icon: Calendar },
              { id: 'departments', name: 'Departments', icon: Building },
              { id: 'security', name: 'Security', icon: Shield },
              { id: 'notifications', name: 'Notifications', icon: Bell },
              { id: 'data', name: 'Data Management', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">General System Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={settings.academicYear}
                    onChange={(e) => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Semester
                  </label>
                  <input
                    type="text"
                    value={settings.currentSemester}
                    onChange={(e) => setSettings(prev => ({ ...prev, currentSemester: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Fall 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Enable Maintenance Mode
                </label>
              </div>
            </div>
          )}

          {/* Academic Settings */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Academic Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Start Date
                  </label>
                  <input
                    type="date"
                    value={settings.enrollmentStartDate}
                    onChange={(e) => setSettings(prev => ({ ...prev, enrollmentStartDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment End Date
                  </label>
                  <input
                    type="date"
                    value={settings.enrollmentEndDate}
                    onChange={(e) => setSettings(prev => ({ ...prev, enrollmentEndDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Enrollment Per Student
                  </label>
                  <input
                    type="number"
                    value={settings.maxEnrollmentPerStudent}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxEnrollmentPerStudent: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Credits Per Semester
                  </label>
                  <input
                    type="number"
                    value={settings.maxCreditsPerSemester}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxCreditsPerSemester: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="12"
                    max="24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={settings.attendanceThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, attendanceThreshold: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA Requirement
                  </label>
                  <input
                    type="number"
                    value={settings.gpaRequirement}
                    onChange={(e) => setSettings(prev => ({ ...prev, gpaRequirement: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="0"
                    max="4"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Semesters List */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Semester Management</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {semesters.map((semester) => (
                        <tr key={semester.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {semester.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {semester.startDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {semester.endDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(semester.status)}`}>
                              {semester.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Departments Settings */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Department Management</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Head
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.head}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(dept.status)}`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="6"
                    max="20"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900">Password Requirements</h4>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireUppercase"
                      checked={settings.passwordPolicy.requireUppercase}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireUppercase: e.target.checked }
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-900">
                      Require uppercase letters
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireLowercase"
                      checked={settings.passwordPolicy.requireLowercase}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireLowercase: e.target.checked }
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireLowercase" className="ml-2 block text-sm text-gray-900">
                      Require lowercase letters
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireNumbers"
                      checked={settings.passwordPolicy.requireNumbers}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireNumbers: e.target.checked }
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-900">
                      Require numbers
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireSpecialChars"
                      checked={settings.passwordPolicy.requireSpecialChars}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: e.target.checked }
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-900">
                      Require special characters
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                    Enable Email Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                    Enable SMS Notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Download className="h-6 w-6 text-blue-600 mr-3" />
                    <h4 className="text-lg font-medium text-gray-900">Data Export</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Export system data for backup or analysis purposes.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Export Data
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Upload className="h-6 w-6 text-green-600 mr-3" />
                    <h4 className="text-lg font-medium text-gray-900">Data Import</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Import data from external sources or restore from backup.
                  </p>
                  <button
                    onClick={handleImportData}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsView;