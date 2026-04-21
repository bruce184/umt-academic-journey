import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Users,
  Eye,
  Globe,
  UserCheck
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Class, Course } from '../../models';

interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'lecturers' | 'admins';
  postedBy: string;
  postedAt: string;
  isPublished: boolean;
  priority: 'low' | 'medium' | 'high';
}

const AdminAnnouncementView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SystemAnnouncement | null>(null);

  // Create announcement form state
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as 'all' | 'students' | 'lecturers' | 'admins',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isPublished: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load all classes and courses for reference
    const allClasses = CourseController.getAllClasses();
    const allCourses = CourseController.getAllCourses();
    setClasses(allClasses);
    setCourses(allCourses);

    // Mock system announcements data
    const mockAnnouncements: SystemAnnouncement[] = [
      {
        id: '1',
        title: 'System Maintenance - Sunday Night',
        content: 'The OCMS system will be undergoing maintenance on Sunday from 10 PM to 2 AM. During this time, the system will be temporarily unavailable. Please plan accordingly.',
        targetAudience: 'all',
        postedBy: 'System Administrator',
        postedAt: '2024-01-15T10:00:00Z',
        isPublished: true,
        priority: 'high'
      },
      {
        id: '2',
        title: 'New Feature: QR Code Attendance',
        content: 'We have implemented a new QR code-based attendance system. All lecturers are required to use this system starting next week. Training sessions will be held on Friday.',
        targetAudience: 'lecturers',
        postedBy: 'Admin Team',
        postedAt: '2024-01-14T14:30:00Z',
        isPublished: true,
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Student Portal Updates',
        content: 'The student portal has been updated with new features including improved course registration and better mobile responsiveness. Please check out the new interface.',
        targetAudience: 'students',
        postedBy: 'IT Department',
        postedAt: '2024-01-13T09:15:00Z',
        isPublished: true,
        priority: 'low'
      }
    ];
    setAnnouncements(mockAnnouncements);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Globe className="h-4 w-4" />;
      case 'students':
        return <Users className="h-4 w-4" />;
      case 'lecturers':
        return <UserCheck className="h-4 w-4" />;
      case 'admins':
        return <Bell className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'All Users';
      case 'students':
        return 'Students Only';
      case 'lecturers':
        return 'Lecturers Only';
      case 'admins':
        return 'Admins Only';
      default:
        return 'Unknown';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = audienceFilter === 'all' || announcement.targetAudience === audienceFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return matchesSearch && matchesAudience && matchesPriority;
  });

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  const handleTogglePublish = (id: string) => {
    setAnnouncements(prev => 
      prev.map(ann => 
        ann.id === id ? { ...ann, isPublished: !ann.isPublished } : ann
      )
    );
  };

  const handleCreateAnnouncement = () => {
    if (!createForm.title || !createForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    const newAnnouncement: SystemAnnouncement = {
      id: Date.now().toString(),
      title: createForm.title,
      content: createForm.content,
      targetAudience: createForm.targetAudience,
      postedBy: currentUser?.fullName || 'System Administrator',
      postedAt: new Date().toISOString(),
      isPublished: createForm.isPublished,
      priority: createForm.priority
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    
    // Reset form
    setCreateForm({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'medium',
      isPublished: true
    });
    
    setShowCreateModal(false);
  };

  const handleCancelCreate = () => {
    setCreateForm({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'medium',
      isPublished: true
    });
    setShowCreateModal(false);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">System Announcements</h1>
            <p className="text-gray-600">
              Create and manage system-wide announcements for all users.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Announcements</p>
              <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(ann => ann.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(ann => ann.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">All Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(ann => ann.targetAudience === 'all').length}
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
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              title="Filter by audience"
            >
              <option value="all">All Audiences</option>
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="lecturers">Lecturers Only</option>
              <option value="admins">Admins Only</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              title="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getPriorityIcon(announcement.priority)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getAudienceLabel(announcement.targetAudience)}
                    </span>
                    {announcement.isPublished ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Posted by {announcement.postedBy}
                  </p>
                  <p className="text-gray-600 line-clamp-2">{announcement.content}</p>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit announcement"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(announcement.postedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400">{new Date(announcement.postedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePublish(announcement.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    announcement.isPublished
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {announcement.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create System Announcement</h3>
              <button
                onClick={handleCancelCreate}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter announcement content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={createForm.targetAudience}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, targetAudience: e.target.value as 'all' | 'students' | 'lecturers' | 'admins' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  title="Select target audience"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="lecturers">Lecturers Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  title="Select priority"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={createForm.isPublished}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelCreate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Announcement Details</h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getPriorityIcon(selectedAnnouncement.priority)}</span>
                  <h4 className="font-medium text-gray-900">{selectedAnnouncement.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                    {selectedAnnouncement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Posted by {selectedAnnouncement.postedBy}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 bg-purple-100 text-purple-800">
                  {getAudienceLabel(selectedAnnouncement.targetAudience)}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Content</p>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Posted</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAnnouncement.postedAt).toLocaleDateString()} at{' '}
                    {new Date(selectedAnnouncement.postedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">
                    {selectedAnnouncement.isPublished ? 'Published' : 'Draft'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
                    Edit Announcement
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    View Recipients
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || audienceFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'You haven\'t created any system announcements yet.'
            }
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Announcement
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementView;