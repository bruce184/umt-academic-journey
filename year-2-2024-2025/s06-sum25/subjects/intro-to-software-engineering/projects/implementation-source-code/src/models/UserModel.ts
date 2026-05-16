import { User, Student, Lecturer, Admin } from './index';

// UserModel - Quáº£n lĂ½ logic nghiá»‡p vá»¥ cho User
// Sync vá»›i database schema OCMS1
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

  // Láº¥y táº¥t cáº£ users
  static getAllUsers(): User[] {
    return this.users;
  }

  // Láº¥y user theo ID
  static getUserById(userId: string): User | undefined {
    return this.users.find(user => user.userId === userId);
  }

  // Láº¥y user theo username
  static getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // Láº¥y users theo role
  static getUsersByRole(role: 'student' | 'lecturer' | 'admin'): User[] {
    return this.users.filter(user => user.role === role);
  }

  // ThĂªm user má»›i
  static addUser(user: Omit<User, 'userId'>): User {
    const newUser: User = {
      ...user,
      userId: `USER${Date.now()}`
    };
    this.users.push(newUser);
    return newUser;
  }

  // Cáº­p nháº­t user
  static updateUser(userId: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  // XĂ³a user
  static deleteUser(userId: string): boolean {
    const index = this.users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // XĂ¡c thá»±c Ä‘Äƒng nháº­p
  static authenticate(username: string, password: string): User | null {
    // Mock authentication - trong thá»±c táº¿ sáº½ kiá»ƒm tra vá»›i database
    const user = this.getUserByUsername(username);
    if (user && password === 'demo-password') { // Mock password
      return user;
    }
    return null;
  }

  // Kiá»ƒm tra quyá»n truy cáº­p
  static hasPermission(userId: string, permission: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Logic kiá»ƒm tra quyá»n theo role
    switch (user.role) {
      case 'admin':
        return true; // Admin cĂ³ táº¥t cáº£ quyá»n
      case 'lecturer':
        return ['view_courses', 'manage_attendance', 'upload_materials', 'manage_assignments'].includes(permission);
      case 'student':
        return ['view_courses', 'view_attendance', 'download_materials', 'submit_assignments'].includes(permission);
      default:
        return false;
    }
  }

  // Láº¥y thĂ´ng tin student
  static getStudent(studentId: string): Student | undefined {
    const user = this.getUserById(studentId);
    if (user && user.role === 'student') {
      return { studentId, user };
    }
    return undefined;
  }

  // Láº¥y thĂ´ng tin lecturer
  static getLecturer(lecturerId: string): Lecturer | undefined {
    const user = this.getUserById(lecturerId);
    if (user && user.role === 'lecturer') {
      return { lecturerId, user };
    }
    return undefined;
  }

  // Láº¥y thĂ´ng tin admin
  static getAdmin(adminId: string): Admin | undefined {
    const user = this.getUserById(adminId);
    if (user && user.role === 'admin') {
      return { adminId, user };
    }
    return undefined;
  }
} 