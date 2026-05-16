import { Course, Class, Semester, Schedule } from './index';

// CourseModel - Quản lý logic nghiệp vụ cho Course
// Sync với database schema OCMS1
export class CourseModel {
  private static courses: Course[] = [
    {
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      credit: 3,
      courseType: 'L'
    },
    {
      courseCode: 'CS102',
      courseName: 'Programming Fundamentals',
      credit: 4,
      courseType: 'P'
    },
    {
      courseCode: 'MATH101',
      courseName: 'Calculus I',
      credit: 4,
      courseType: 'L'
    },
    {
      courseCode: 'ENG101',
      courseName: 'English Composition',
      credit: 3,
      courseType: 'L'
    },
    {
      courseCode: 'PHYS101',
      courseName: 'Physics I',
      credit: 4,
      courseType: 'L'
    }
  ];

  private static semesters: Semester[] = [
    { semesterCode: 'Fall', year: 2024 },
    { semesterCode: 'Spring', year: 2024 }
  ];

  private static classes: Class[] = [
    {
      classId: 'CS101-F24-01',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      semesterCode: 'Fall',
      year: 2024,
      capacity: 30,
      currentEnrollment: 3
    },
    {
      classId: 'CS102-F24-01',
      courseCode: 'CS102',
      courseName: 'Programming Fundamentals',
      semesterCode: 'Fall',
      year: 2024,
      capacity: 25,
      currentEnrollment: 2
    },
    {
      classId: 'MATH101-F24-01',
      courseCode: 'MATH101',
      courseName: 'Calculus I',
      semesterCode: 'Fall',
      year: 2024,
      capacity: 35,
      currentEnrollment: 2
    }
  ];

  private static schedules: Schedule[] = [
    {
      scheduleId: 'SCH001',
      classId: 'CS101-F24-01',
      room: 'Room 101',
      timeSlot: 'Monday 9:00 AM - 10:30 AM'
    },
    {
      scheduleId: 'SCH002',
      classId: 'CS102-F24-01',
      room: 'Lab 201',
      timeSlot: 'Tuesday 2:00 PM - 4:00 PM'
    },
    {
      scheduleId: 'SCH003',
      classId: 'MATH101-F24-01',
      room: 'Room 102',
      timeSlot: 'Wednesday 10:00 AM - 11:30 AM'
    }
  ];

  // Lấy tất cả courses
  static getAllCourses(): Course[] {
    return this.courses;
  }

  // Lấy course theo code
  static getCourseByCode(courseCode: string): Course | undefined {
    return this.courses.find(course => course.courseCode === courseCode);
  }

  // Lấy courses theo type
  static getCoursesByType(courseType: 'L' | 'P' | 'T'): Course[] {
    return this.courses.filter(course => course.courseType === courseType);
  }

  // Thêm course mới
  static addCourse(course: Course): Course {
    this.courses.push(course);
    return course;
  }

  // Cập nhật course
  static updateCourse(courseCode: string, updates: Partial<Course>): Course | null {
    const index = this.courses.findIndex(course => course.courseCode === courseCode);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updates };
      return this.courses[index];
    }
    return null;
  }

  // Xóa course
  static deleteCourse(courseCode: string): boolean {
    const index = this.courses.findIndex(course => course.courseCode === courseCode);
    if (index !== -1) {
      this.courses.splice(index, 1);
      return true;
    }
    return false;
  }

  // Lấy tất cả classes
  static getAllClasses(): Class[] {
    return this.classes;
  }

  // Lấy classes theo course
  static getClassesByCourse(courseCode: string): Class[] {
    return this.classes.filter(cls => cls.courseCode === courseCode);
  }

  // Lấy classes theo semester
  static getClassesBySemester(semesterCode: string, year: number): Class[] {
    return this.classes.filter(cls => 
      cls.semesterCode === semesterCode && cls.year === year
    );
  }

  // Thêm class mới
  static addClass(cls: Class): Class {
    this.classes.push(cls);
    return cls;
  }

  // Kiểm tra xem class có còn chỗ không
  static isClassAvailable(classId: string): boolean {
    const cls = this.classes.find(c => c.classId === classId);
    if (!cls) return false;
    return cls.currentEnrollment < cls.capacity;
  }

  // Đăng ký học viên vào class
  static enrollStudent(classId: string): boolean {
    const cls = this.classes.find(c => c.classId === classId);
    if (!cls || !this.isClassAvailable(classId)) return false;
    
    cls.currentEnrollment += 1;
    return true;
  }

  // Hủy đăng ký học viên
  static unenrollStudent(classId: string): boolean {
    const cls = this.classes.find(c => c.classId === classId);
    if (!cls || cls.currentEnrollment <= 0) return false;
    
    cls.currentEnrollment -= 1;
    return true;
  }

  // Lấy schedule cho class
  static getScheduleForClass(classId: string): Schedule | undefined {
    return this.schedules.find(schedule => schedule.classId === classId);
  }

  // Lấy tất cả schedules
  static getAllSchedules(): Schedule[] {
    return this.schedules;
  }

  // Lấy semesters
  static getAllSemesters(): Semester[] {
    return this.semesters;
  }

  // Lấy thông tin chi tiết course với classes
  static getCourseDetails(courseCode: string): { course: Course | undefined; classes: Class[] } {
    const course = this.getCourseByCode(courseCode);
    const classes = this.getClassesByCourse(courseCode);
    return { course, classes };
  }
} 