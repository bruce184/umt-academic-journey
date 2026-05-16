import { AuthController } from './AuthController';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  classId?: string;
  courseName?: string;
  targetAudience?: 'all' | 'students' | 'lecturers' | 'admins';
  postedBy: string;
  postedAt: string;
  isPublished: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'class' | 'system';
}

export class AnnouncementController {
  private static announcements: Announcement[] = [
    // Lecturer announcements (class-specific)
    {
      id: '1',
      title: 'Assignment 1 Due Date Extended',
      content: 'Due to technical difficulties, the due date for Assignment 1 has been extended to Friday, January 20th. Please submit your work through the online portal.',
      classId: 'CS101-A101',
      courseName: 'Introduction to Computer Science',
      postedBy: 'Dr. John Smith',
      postedAt: '2024-01-15T10:00:00Z',
      isPublished: true,
      priority: 'high',
      type: 'class'
    },
    {
      id: '2',
      title: 'Class Cancelled - Tomorrow',
      content: 'Tomorrow\'s class will be cancelled due to a faculty meeting. We will cover the material in the next session.',
      classId: 'CS201-B202',
      courseName: 'Data Structures and Algorithms',
      postedBy: 'Dr. John Smith',
      postedAt: '2024-01-14T14:30:00Z',
      isPublished: true,
      priority: 'medium',
      type: 'class'
    },
    {
      id: '3',
      title: 'Lab Session Schedule Updated',
      content: 'The lab session for this week has been rescheduled to Thursday afternoon. Please check your email for the new room assignment.',
      classId: 'CS101-A101',
      courseName: 'Introduction to Computer Science',
      postedBy: 'Dr. John Smith',
      postedAt: '2024-01-13T09:15:00Z',
      isPublished: true,
      priority: 'low',
      type: 'class'
    },
    // System announcements (from admin)
    {
      id: '4',
      title: 'System Maintenance - Sunday Night',
      content: 'The OCMS system will be undergoing maintenance on Sunday from 10 PM to 2 AM. During this time, the system will be temporarily unavailable. Please plan accordingly.',
      targetAudience: 'all',
      postedBy: 'System Administrator',
      postedAt: '2024-01-15T10:00:00Z',
      isPublished: true,
      priority: 'high',
      type: 'system'
    },
    {
      id: '5',
      title: 'New Feature: QR Code Attendance',
      content: 'We have implemented a new QR code-based attendance system. All lecturers are required to use this system starting next week. Training sessions will be held on Friday.',
      targetAudience: 'lecturers',
      postedBy: 'Admin Team',
      postedAt: '2024-01-14T14:30:00Z',
      isPublished: true,
      priority: 'medium',
      type: 'system'
    },
    {
      id: '6',
      title: 'Student Portal Updates',
      content: 'The student portal has been updated with new features including improved course registration and better mobile responsiveness. Please check out the new interface.',
      targetAudience: 'students',
      postedBy: 'IT Department',
      postedAt: '2024-01-13T09:15:00Z',
      isPublished: true,
      priority: 'low',
      type: 'system'
    }
  ];

  // Get all announcements for a specific user role
  static getAnnouncementsForUser(userRole: string): Announcement[] {
    const currentUser = AuthController.getCurrentUser();
    
    return this.announcements.filter(announcement => {
      // Always include system announcements that target the user's role or all users
      if (announcement.type === 'system') {
        return announcement.targetAudience === 'all' || 
               announcement.targetAudience === userRole;
      }
      
      // For class announcements, include if user is a student in that class
      // or if user is a lecturer teaching that class
      if (announcement.type === 'class' && announcement.classId) {
        if (userRole === 'student') {
          // In a real app, check if student is enrolled in this class
          return true; // For demo, show all class announcements
        } else if (userRole === 'lecturer') {
          // Check if lecturer is teaching this class
          return announcement.postedBy === currentUser?.fullName;
        }
      }
      
      return false;
    }).sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  // Get announcements for a specific lecturer
  static getAnnouncementsByLecturer(lecturerId: string): Announcement[] {
    return this.announcements.filter(announcement => 
      announcement.type === 'class' && 
      announcement.postedBy === lecturerId
    ).sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  // Get all system announcements (for admin)
  static getSystemAnnouncements(): Announcement[] {
    return this.announcements.filter(announcement => 
      announcement.type === 'system'
    ).sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  // Create a new announcement
  static createAnnouncement(announcement: Omit<Announcement, 'id' | 'postedAt'>): Announcement {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      postedAt: new Date().toISOString()
    };

    this.announcements.unshift(newAnnouncement);
    return newAnnouncement;
  }

  // Update an announcement
  static updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const index = this.announcements.findIndex(ann => ann.id === id);
    if (index === -1) return null;

    this.announcements[index] = { ...this.announcements[index], ...updates };
    return this.announcements[index];
  }

  // Delete an announcement
  static deleteAnnouncement(id: string): boolean {
    const index = this.announcements.findIndex(ann => ann.id === id);
    if (index === -1) return false;

    this.announcements.splice(index, 1);
    return true;
  }

  // Toggle publish status
  static togglePublishStatus(id: string): boolean {
    const announcement = this.announcements.find(ann => ann.id === id);
    if (!announcement) return false;

    announcement.isPublished = !announcement.isPublished;
    return true;
  }

  // Get announcement statistics
  static getAnnouncementStats(userRole: string) {
    const userAnnouncements = this.getAnnouncementsForUser(userRole);
    
    return {
      total: userAnnouncements.length,
      published: userAnnouncements.filter(ann => ann.isPublished).length,
      highPriority: userAnnouncements.filter(ann => ann.priority === 'high').length,
      system: userAnnouncements.filter(ann => ann.type === 'system').length,
      class: userAnnouncements.filter(ann => ann.type === 'class').length
    };
  }

  // Search announcements
  static searchAnnouncements(query: string, userRole: string): Announcement[] {
    const userAnnouncements = this.getAnnouncementsForUser(userRole);
    
    if (!query.trim()) return userAnnouncements;

    return userAnnouncements.filter(announcement =>
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      announcement.content.toLowerCase().includes(query.toLowerCase()) ||
      announcement.postedBy.toLowerCase().includes(query.toLowerCase())
    );
  }
} 