import { User } from '../models';
import { UserModel } from '../models/UserModel';

// AuthController - Xử lý logic điều khiển authentication
// Sync với database schema OCMS1
export class AuthController {
  private static currentUser: User | null = null;

  // Đăng nhập
  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate input
      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      // Authenticate user
      const user = UserModel.authenticate(username, password);
      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Set current user
      this.currentUser = user;

      // Store in localStorage (in real app, use secure token)
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Đăng xuất
  static logout(): { success: boolean } {
    try {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Kiểm tra trạng thái đăng nhập
  static isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Lấy thông tin user hiện tại
  static getCurrentUser(): User | null {
    if (!this.currentUser) {
      // Try to restore from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  // Kiểm tra quyền truy cập
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return UserModel.hasPermission(user.userId, permission);
  }

  // Kiểm tra role
  static hasRole(role: 'student' | 'lecturer' | 'admin'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Lấy role hiện tại
  static getCurrentRole(): 'student' | 'lecturer' | 'admin' | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Cập nhật thông tin user
  static updateUserProfile(updates: Partial<User>): { success: boolean; user?: User; error?: string } {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not logged in' };
      }

      const updatedUser = UserModel.updateUser(currentUser.userId, updates);
      if (!updatedUser) {
        return { success: false, error: 'Failed to update user' };
      }

      // Update current user
      this.currentUser = updatedUser;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Update failed. Please try again.' };
    }
  }

  // Đổi mật khẩu (mock)
  static changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      // Mock password validation
      if (currentPassword !== 'password123') {
        return { success: false, error: 'Current password is incorrect' };
      }

      // In real app, update password in database
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  }

  // Khởi tạo authentication state
  static initializeAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }
} 