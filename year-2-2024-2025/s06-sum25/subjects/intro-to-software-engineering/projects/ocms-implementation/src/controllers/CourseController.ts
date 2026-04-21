import { Course, Class, Semester, Schedule } from '../models';
import { CourseModel } from '../models/CourseModel';
import { AuthController } from './AuthController';

// CourseController - Xử lý logic điều khiển cho Course
// Sync với database schema OCMS1
export class CourseController {
  // Lấy tất cả courses
  static getAllCourses(): Course[] {
    return CourseModel.getAllCourses();
  }

  // Lấy course theo code
  static getCourseByCode(courseCode: string): Course | undefined {
    return CourseModel.getCourseByCode(courseCode);
  }

  // Lấy courses theo role của user hiện tại
  static getCoursesForCurrentUser(): Course[] {
    const currentUser = AuthController.getCurrentUser();
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'student':
        // Students see all courses
        return CourseModel.getAllCourses();
      case 'lecturer':
        // Lecturers see all courses (in real app, filter by assigned courses)
        return CourseModel.getAllCourses();
      case 'admin':
        // Admins see all courses
        return CourseModel.getAllCourses();
      default:
        return [];
    }
  }

  // Lấy courses theo type
  static getCoursesByType(courseType: 'L' | 'P' | 'T'): Course[] {
    return CourseModel.getCoursesByType(courseType);
  }

  // Thêm course mới (chỉ admin)
  static addCourse(courseData: Course): { success: boolean; course?: Course; error?: string } {
    try {
      // Check permissions
      if (!AuthController.hasRole('admin')) {
        return { success: false, error: 'Only administrators can add courses' };
      }

      const course = CourseModel.addCourse(courseData);
      return { success: true, course };
    } catch (error) {
      return { success: false, error: 'Failed to add course' };
    }
  }

  // Cập nhật course
  static updateCourse(courseCode: string, updates: Partial<Course>): { success: boolean; course?: Course; error?: string } {
    try {
      const currentUser = AuthController.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not logged in' };
      }

      // Check if user can update this course
      const course = CourseModel.getCourseByCode(courseCode);
      if (!course) {
        return { success: false, error: 'Course not found' };
      }

      // Only admin can update courses
      if (!AuthController.hasRole('admin')) {
        return { success: false, error: 'Insufficient permissions' };
      }

      const updatedCourse = CourseModel.updateCourse(courseCode, updates);
      if (!updatedCourse) {
        return { success: false, error: 'Failed to update course' };
      }

      return { success: true, course: updatedCourse };
    } catch (error) {
      return { success: false, error: 'Failed to update course' };
    }
  }

  // Xóa course (chỉ admin)
  static deleteCourse(courseCode: string): { success: boolean; error?: string } {
    try {
      if (!AuthController.hasRole('admin')) {
        return { success: false, error: 'Only administrators can delete courses' };
      }

      const success = CourseModel.deleteCourse(courseCode);
      if (!success) {
        return { success: false, error: 'Course not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete course' };
    }
  }

  // Lấy tất cả classes
  static getAllClasses(): Class[] {
    return CourseModel.getAllClasses();
  }

  // Lấy classes theo course
  static getClassesByCourse(courseCode: string): Class[] {
    return CourseModel.getClassesByCourse(courseCode);
  }

  // Lấy classes theo semester
  static getClassesBySemester(semesterCode: string, year: number): Class[] {
    return CourseModel.getClassesBySemester(semesterCode, year);
  }

  // Lấy classes theo lecturer
  static getClassesByLecturer(lecturerId: string): Class[] {
    // In real app, would filter by lecturer assignment
    // For now, return all classes
    return CourseModel.getAllClasses();
  }

  // Lấy courses theo lecturer
  static getCoursesByLecturer(lecturerId: string): Course[] {
    // In real app, would filter by lecturer assignment
    // For now, return all courses
    return CourseModel.getAllCourses();
  }

  // Lấy classes cho user hiện tại
  static getClassesForCurrentUser(): Class[] {
    const currentUser = AuthController.getCurrentUser();
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'student':
        // Students see all classes (in real app, filter by enrolled classes)
        return CourseModel.getAllClasses();
      case 'lecturer':
        // Lecturers see all classes (in real app, filter by assigned classes)
        return CourseModel.getAllClasses();
      case 'admin':
        // Admins see all classes
        return CourseModel.getAllClasses();
      default:
        return [];
    }
  }

  // Thêm class mới (chỉ admin)
  static addClass(classData: Class): { success: boolean; class?: Class; error?: string } {
    try {
      const currentUser = AuthController.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not logged in' };
      }

      // Only admin can add classes
      if (!AuthController.hasRole('admin')) {
        return { success: false, error: 'Insufficient permissions' };
      }

      const newClass = CourseModel.addClass(classData);
      return { success: true, class: newClass };
    } catch (error) {
      return { success: false, error: 'Failed to add class' };
    }
  }

  // Lấy schedules
  static getAllSchedules(): Schedule[] {
    return CourseModel.getAllSchedules();
  }

  // Lấy schedule cho class
  static getScheduleForClass(classId: string): Schedule | undefined {
    return CourseModel.getScheduleForClass(classId);
  }

  // Lấy semesters
  static getAllSemesters(): Semester[] {
    return CourseModel.getAllSemesters();
  }

  // Kiểm tra xem class có còn chỗ không
  static isClassAvailable(classId: string): boolean {
    return CourseModel.isClassAvailable(classId);
  }

  // Đăng ký học viên vào class
  static enrollStudent(classId: string): { success: boolean; error?: string } {
    try {
      const currentUser = AuthController.getCurrentUser();
      if (!currentUser || currentUser.role !== 'student') {
        return { success: false, error: 'Only students can enroll in classes' };
      }

      if (!CourseModel.isClassAvailable(classId)) {
        return { success: false, error: 'Class is full' };
      }

      const success = CourseModel.enrollStudent(classId);
      if (!success) {
        return { success: false, error: 'Failed to enroll in class' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to enroll in class' };
    }
  }

  // Hủy đăng ký học viên
  static unenrollStudent(classId: string): { success: boolean; error?: string } {
    try {
      const currentUser = AuthController.getCurrentUser();
      if (!currentUser || currentUser.role !== 'student') {
        return { success: false, error: 'Only students can unenroll from classes' };
      }

      const success = CourseModel.unenrollStudent(classId);
      if (!success) {
        return { success: false, error: 'Failed to unenroll from class' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to unenroll from class' };
    }
  }

  // Lấy thông tin chi tiết course với classes
  static getCourseDetails(courseCode: string): { success: boolean; data?: { course: Course | undefined; classes: Class[] }; error?: string } {
    try {
      const data = CourseModel.getCourseDetails(courseCode);
      if (!data.course) {
        return { success: false, error: 'Course not found' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to get course details' };
    }
  }
} 