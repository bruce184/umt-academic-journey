import React, { useState, useEffect } from 'react';
import { Bell, Search, Calendar, X } from 'lucide-react';
// import { AuthController } from '../../controllers/AuthController'; // Unused for now
import { Announcement } from '../../models';

// StudentAnnouncementView - Giao diện thông báo cho student (View trong MVC)
const StudentAnnouncementView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  // const currentUser = AuthController.getCurrentUser(); // Unused for now

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery]);

  const loadAnnouncements = () => {
    setLoading(true);
    
    // Mock announcements data - combining lecturer and system announcements
    const mockAnnouncements: Announcement[] = [
      // Lecturer announcements (class-specific)
      {
        announcementId: '1',
        classId: 'CS101-F24-01',
        title: 'Assignment 1 Due Date Extended',
        content: 'Due to technical difficulties, the due date for Assignment 1 has been extended to Friday, January 20th. Please submit your work through the online portal.',
        postedAt: '2024-01-15T10:00:00Z'
      },
      {
        announcementId: '2',
        classId: 'CS102-F24-01',
        title: 'Lab Session Schedule Updated',
        content: 'The lab session for this week has been rescheduled to Thursday afternoon. Please check your email for the new room assignment.',
        postedAt: '2024-01-14T14:30:00Z'
      },
      // System announcements (from admin)
      {
        announcementId: '3',
        classId: 'SYSTEM',
        title: 'System Maintenance - Sunday Night',
        content: 'The OCMS system will be undergoing maintenance on Sunday from 10 PM to 2 AM. During this time, the system will be temporarily unavailable. Please plan accordingly.',
        postedAt: '2024-01-15T10:00:00Z'
      },
      {
        announcementId: '4',
        classId: 'SYSTEM',
        title: 'Student Portal Updates',
        content: 'The student portal has been updated with new features including improved course registration and better mobile responsiveness. Please check out the new interface.',
        postedAt: '2024-01-13T09:15:00Z'
      },
      {
        announcementId: '5',
        classId: 'MATH101-F24-01',
        title: 'Course Registration Deadline',
        content: 'The deadline for course registration for the Spring semester is January 25, 2024. Please ensure all registrations are completed by this date.',
        postedAt: '2024-01-12T00:00:00Z'
      }
    ];

    setAnnouncements(mockAnnouncements);
    setLoading(false);
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const getPriorityColor = () => {
    return 'text-blue-600 bg-blue-100';
  };

  const getPriorityIcon = () => {
    return <Bell className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
        <p className="text-gray-600">
          Stay updated with the latest announcements from your lecturers and administration.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Announcements ({filteredAnnouncements.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for updates.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.announcementId}
                  onClick={() => handleAnnouncementClick(announcement)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-1 rounded-full ${getPriorityColor()}`}>
                          {getPriorityIcon()}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </h3>
                        {announcement.classId === 'SYSTEM' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {announcement.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(announcement.postedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getPriorityColor()}`}>
                  {getPriorityIcon()}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500 border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted on {formatDate(selectedAnnouncement.postedAt)}</span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncementView; 