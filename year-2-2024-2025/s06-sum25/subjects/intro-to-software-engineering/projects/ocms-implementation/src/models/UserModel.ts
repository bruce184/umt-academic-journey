import { User, Student, Lecturer, Admin } from './index';

// UserModel - Quản lý logic nghiệp vụ cho User
// Sync với database schema OCMS1
export class UserModel {
  private static users: User[] = [
    {
      userId: 'STU001',
      username: 'student1',
      fullName: 'Alice Johnson',
      role: 'student',
      email: 'alice@student.ocms.edu',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      userId: 'LEC001',
      username: 'dr.smith',
      fullName: 'Dr. John Smith',
      role: 'lecturer',
      email: 'smith@ocms.edu',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      userId: 'ADMIN001',
      username: 'admin',
      fullName: 'System Administrator',
      role: 'admin',
      email: 'admin@ocms.edu',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  // Lấy tất cả users
  static getAllUsers(): User[] {
    return this.users;
  }

  // Lấy user theo ID
  static getUserById(userId: string): User | undefined {
    return this.users.find(user => user.userId === userId);
  }

  // Lấy user theo username
  static getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // Lấy users theo role
  static getUsersByRole(role: 'student' | 'lecturer' | 'admin'): User[] {
    return this.users.filter(user => user.role === role);
  }

  // Thêm user mới
  static addUser(user: Omit<User, 'userId'>): User {
    const newUser: User = {
      ...user,
      userId: `USER${Date.now()}`
    };
    this.users.push(newUser);
    return newUser;
  }

  // Cập nhật user
  static updateUser(userId: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  // Xóa user
  static deleteUser(userId: string): boolean {
    const index = this.users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // Xác thực đăng nhập
  static authenticate(username: string, password: string): User | null {
    // Mock authentication - trong thực tế sẽ kiểm tra với database
    const user = this.getUserByUsername(username);
    if (user && password === 'password123') { // Mock password
      return user;
    }
    return null;
  }

  // Kiểm tra quyền truy cập
  static hasPermission(userId: string, permission: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Logic kiểm tra quyền theo role
    switch (user.role) {
      case 'admin':
        return true; // Admin có tất cả quyền
      case 'lecturer':
        return ['view_courses', 'manage_attendance', 'upload_materials', 'manage_assignments'].includes(permission);
      case 'student':
        return ['view_courses', 'view_attendance', 'download_materials', 'submit_assignments'].includes(permission);
      default:
        return false;
    }
  }

  // Lấy thông tin student
  static getStudent(studentId: string): Student | undefined {
    const user = this.getUserById(studentId);
    if (user && user.role === 'student') {
      return { studentId, user };
    }
    return undefined;
  }

  // Lấy thông tin lecturer
  static getLecturer(lecturerId: string): Lecturer | undefined {
    const user = this.getUserById(lecturerId);
    if (user && user.role === 'lecturer') {
      return { lecturerId, user };
    }
    return undefined;
  }

  // Lấy thông tin admin
  static getAdmin(adminId: string): Admin | undefined {
    const user = this.getUserById(adminId);
    if (user && user.role === 'admin') {
      return { adminId, user };
    }
    return undefined;
  }
} 