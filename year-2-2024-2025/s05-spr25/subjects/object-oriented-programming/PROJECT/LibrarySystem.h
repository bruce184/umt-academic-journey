#ifndef LIBRARYSYSTEM_H
#define LIBRARYSYSTEM_H

#include "Book.cpp"
#include "User.cpp"
#include <limits>

// Cấu trúc node cho danh sách liên kết sách
struct BookNode {
    Book data;
    BookNode *next;
    BookNode(const Book &b);
};

// Cấu trúc node cho danh sách liên kết user
struct UserNode {
    User* data; // Con trỏ lưu đối tượng User hoặc Admin
    UserNode *next;
    UserNode(User* u);
};

class LibrarySystem {
private:
    BookNode *bookHead; // Con trỏ đầu danh sách sách
    UserNode *userHead; // Con trỏ đầu danh sách user
    User* currentUser;  // Người dùng hiện tại sau đăng nhập
public:
    LibrarySystem();
    ~LibrarySystem();

    // Khởi tạo dữ liệu mẫu (hoặc có thể đọc từ file)
    void initData();

    // Thêm sách và user vào danh sách
    void addBook(const Book &b);
    void addUser(User* u);

    // Hàm đăng nhập
    bool login();

    // Chạy hệ thống với menu tương ứng
    void run();
    void adminMenu();
    void userMenu() const;

    // Các chức năng hỗ trợ cho menu
    void displayAllBooks() const;
    void addBookMenu();
    void searchBook() const;
    void displayAllUsers() const;
};

#endif // LIBRARYSYSTEM_H
