import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Users, 
  FileText, 
  Bell, 
  User, 
  CreditCard,
  GraduationCap,
  ClipboardList,
  Upload
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

const Sidebar: React.FC = () => {
  const currentUser = AuthController.getCurrentUser();
  const currentRole = AuthController.getCurrentRole();

  const getRoleColor = () => {
    switch (currentRole) {
      case 'student':
        return 'border-green-500 bg-green-50';
      case 'lecturer':
        return 'border-blue-500 bg-blue-50';
      case 'admin':
        return 'border-gray-200 bg-white'; // Không đổi màu nền sidebar admin
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getAccentColor = () => {
    switch (currentRole) {
      case 'student':
        return 'text-[#eab308] hover:bg-yellow-50'; // Vàng cho student, không quá chói
      case 'lecturer':
        return 'text-blue-600 hover:bg-blue-50';
      case 'admin':
        return 'text-[#16a34a] hover:bg-gray-100'; // Xanh lá cây đậm cho admin
      default:
        return 'text-gray-600 hover:bg-gray-50';
    }
  };

  const getActiveColor = () => {
    switch (currentRole) {
      case 'student':
        return 'bg-yellow-100 text-[#eab308] border-r-2 border-yellow-400'; // Vàng cho student
      case 'lecturer':
        return 'bg-blue-100 text-blue-700 border-r-2 border-blue-500';
      case 'admin':
        return 'bg-gray-100 text-[#16a34a] border-r-2 border-gray-200'; // Xanh lá cây đậm cho admin
      default:
        return 'bg-gray-100 text-gray-700 border-r-2 border-gray-500';
    }
  };

  const studentNavItems = [
    { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/classes', icon: GraduationCap, label: 'Classes' },
    { to: '/student/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/student/attendance', icon: ClipboardList, label: 'Attendance' },
    { to: '/student/announcements', icon: Bell, label: 'Announcements' },
    { to: '/student/tuition-fee', icon: CreditCard, label: 'Tuition Fee' },
  ];

  const lecturerNavItems = [
    { to: '/lecturer/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/lecturer/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/lecturer/classes', icon: GraduationCap, label: 'Classes' },
    { to: '/lecturer/attendance', icon: ClipboardList, label: 'Attendance' },
    { to: '/lecturer/materials', icon: Upload, label: 'Materials' },
    { to: '/lecturer/tests', icon: FileText, label: 'Tests & Assignments' },
    { to: '/lecturer/announcements', icon: Bell, label: 'Announcements' },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/accounts', icon: Users, label: 'Manage Accounts' },
    { to: '/admin/courses', icon: BookOpen, label: 'Manage Courses' },
    { to: '/admin/classes', icon: GraduationCap, label: 'Manage Classes' },
    { to: '/admin/announcements', icon: Bell, label: 'Announcements' },
    { to: '/admin/tuition-fee', icon: CreditCard, label: 'Tuition Management' },
  ];

  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
        return studentNavItems;
      case 'lecturer':
        return lecturerNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  return (
    <aside className={`w-64 bg-white shadow-lg border-r ${getRoleColor()} min-h-screen`}>
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-1">OCMS</h1>
          <p className="text-xs text-gray-500">Online Course Management System</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">

        {getNavItems().map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? getActiveColor()
                  : `${getAccentColor()} hover:bg-gray-50`
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Courses</span>
              <span className="font-medium text-gray-900">
                {currentRole === 'student' ? '5' : currentRole === 'lecturer' ? '3' : '12'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Classes</span>
              <span className="font-medium text-gray-900">
                {currentRole === 'student' ? '8' : currentRole === 'lecturer' ? '6' : '24'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Students</span>
              <span className="font-medium text-gray-900">
                {currentRole === 'lecturer' ? '45' : currentRole === 'admin' ? '156' : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 