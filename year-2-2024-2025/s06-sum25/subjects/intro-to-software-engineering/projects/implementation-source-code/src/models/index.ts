// Models - Quản lý dữ liệu và logic nghiệp vụ
// Sync với database schema OCMS1

export interface User {
  userId: string;
  username: string;
  fullName: string;
  role: 'student' | 'lecturer' | 'admin';
  email?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Student {
  studentId: string;
  user: User;
}

export interface Lecturer {
  lecturerId: string;
  user: User;
}

export interface Admin {
  adminId: string;
  user: User;
}

export interface Course {
  courseCode: string;
  courseName: string;
  credit: number;
  courseType: 'L' | 'P' | 'T'; // Lecture, Practical, Theory
}

export interface Semester {
  semesterCode: string;
  year: number;
}

export interface Class {
  classId: string;
  courseCode: string;
  courseName: string;
  semesterCode: string;
  year: number;
  capacity: number;
  currentEnrollment: number;
}

export interface Schedule {
  scheduleId: string;
  classId: string;
  room: string;
  timeSlot: string;
}

export interface Enrollment {
  classId: string;
  studentId: string;
  enrolledAt: string;
  grade?: number;
  status: 'enrolled' | 'completed' | 'dropped' | 'failed';
}

export interface ClassInstructor {
  classId: string;
  instructorId: string;
  role: 'primary' | 'assistant';
  semesterCode: string;
  year: number;
}

export interface Assignment {
  assignmentId: number;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore: number;
  createdAt: string;
  classId: string;
}

export interface Submission {
  assignmentId: number;
  studentId: string;
  submittedAt: string;
  content?: string;
  filePath?: string;
  score?: number;
}

export interface Material {
  materialId: string;
  courseCode: string;
  title: string;
  description?: string;
  filePath: string;
  classId: string;
}

export interface Announcement {
  announcementId: string;
  classId: string;
  title: string;
  content: string;
  postedAt: string;
}

export interface AttendanceRecord {
  scheduleId: string;
  studentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedBy: string;
  recordedAt: string;
}

export interface TuitionPayment {
  paymentId: number;
  studentId: string;
  semesterCode: string;
  year: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  receiptNumber?: string;
}

export interface Degree {
  userId: string;
  degree: string;
  graduationDate: string;
  gpa: number;
} 