#include "LibrarySystem.h"
#include <iostream>
#include <limits>
using namespace std;

// ===== Cấu trúc node sách =====
BookNode::BookNode(const Book &b) : data(b), next(nullptr) {}

// ===== Cấu trúc node user =====
UserNode::UserNode(User* u) : data(u), next(nullptr) {}

// ===== Implementation của LibrarySystem =====
LibrarySystem::LibrarySystem() : bookHead(nullptr), userHead(nullptr), currentUser(nullptr) {}

LibrarySystem::~LibrarySystem() {
    // Giải phóng danh sách sách
    BookNode* currB = bookHead;
    while (currB) {
        BookNode* temp = currB;
        currB = currB->next;
        delete temp;
    }
    // Giải phóng danh sách user (và các đối tượng User)
    UserNode* currU = userHead;
    while (currU) {
        UserNode* temp = currU;
        currU = currU->next;
        delete temp->data;
        delete temp;
    }
}

void LibrarySystem::initData() {
    // Thêm sách mẫu
    Book b1("B001", "Lap Trinh C++", "Tac gia A", false);
    Book b2("B002", "Lap Trinh Java", "Tac gia B", false);
    Book b3("B003", "Lap Trinh Python", "Tac gia C", true);
    addBook(b1);
    addBook(b2);
    addBook(b3);

    // Thêm user mẫu: Admin và user thông thường
    Admin* ad = new Admin("AD001", "admin", "123");
    addUser(ad);
    User* u2 = new User("U002", "Sorai", "123");
    addUser(u2);
    User* u1 = new User("U001", "user1", "111");
    addUser(u1);
}

void LibrarySystem::addBook(const Book &b) {
    BookNode* newNode = new BookNode(b);
    if (!bookHead)
        bookHead = newNode;
    else {
        BookNode* temp = bookHead;
        while (temp->next)
            temp = temp->next;
        temp->next = newNode;
    }
}

void LibrarySystem::addUser(User* u) {
    UserNode* newNode = new UserNode(u);
    if (!userHead)
        userHead = newNode;
    else {
        UserNode* temp = userHead;
        while (temp->next)
            temp = temp->next;
        temp->next = newNode;
    }
}

bool LibrarySystem::login() {
    cout << "\n===== DANG NHAP =====" << endl;
    cout << "Nhap ten nguoi dung: ";
    string uname;
    cin >> uname;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    // Tìm kiếm xem đã có tài khoản với username này chưa
    UserNode* temp = userHead;
    while (temp) {
        if (temp->data->getUsername() == uname) {
            currentUser = temp->data;
            cout << "Dang nhap thanh cong!" << endl;
            return true;
        }
        temp = temp->next;
    }

    // Nếu không tìm thấy, tự động tạo tài khoản mới với id "GUEST"
    User* newUser = new User("GUEST", uname, "");
    addUser(newUser);
    currentUser = newUser;
    cout << "Tai khoan moi duoc tao va dang nhap thanh cong!" << endl;
    return true;
}


void LibrarySystem::run() {
    initData();
    if (!login())
        return;
    if (currentUser->isAdmin())
        adminMenu();
    else
        userMenu();
}

void LibrarySystem::adminMenu() {
    int choice;
    do {
        cout << "\n===== ADMIN MENU =====" << endl;
        cout << "1. Xem danh sach sach" << endl;
        cout << "2. Them sach" << endl;
        cout << "3. Tim kiem sach" << endl;
        cout << "4. Xem danh sach user" << endl;
        cout << "5. Thoat" << endl;
        cout << "Nhap lua chon: ";
        cin >> choice;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        system("cls");
        switch (choice) {
            case 1:
                displayAllBooks();
                break;
            case 2:
                addBookMenu();
                break;
            case 3:
                searchBook();
                break;
            case 4:
                displayAllUsers();
                break;
            case 5:
                cout << "Dang xuat..." << endl;
                return;
            default:
                cout << "Lua chon khong hop le. Vui long thu lai!" << endl;
        }
    } while (true);
}

void LibrarySystem::userMenu() const {
    int choice;
    do {
        cout << "\n===== USER MENU =====" << endl;
        cout << "1. Xem danh sach sach" << endl;
        cout << "2. Tim kiem sach" << endl;
        cout << "3. Thoat" << endl;
        cout << "Nhap lua chon: ";
        cin >> choice;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        system("cls");
        switch (choice) {
            case 1:
                displayAllBooks();
                break;
            case 2:
                searchBook();
                break;
            case 3:
                cout << "Dang xuat..." << endl;
                return;
            default:
                cout << "Lua chon khong hop le. Vui long thu lai!" << endl;
        }
    } while (true);
}

void LibrarySystem::displayAllBooks() const {
    cout << "\n===== DANH SACH SACH =====" << endl;
    BookNode* temp = bookHead;
    while (temp) {
        temp->data.display();
        temp = temp->next;
    }
}

void LibrarySystem::addBookMenu() {
    cout << "\n===== THEM SACH MOI =====" << endl;
    Book b;
    b.input();
    addBook(b);
    cout << "Da them sach thanh cong!" << endl;
}

void LibrarySystem::searchBook() const {
    cout << "\n===== TIM KIEM SACH =====" << endl;
    cout << "Nhap tu khoa (ID hoac ten sach): ";
    string keyword;
    getline(cin, keyword);
    BookNode* temp = bookHead;
    bool found = false;
    while (temp) {
        if (temp->data.getBookID() == keyword || temp->data.getTitle() == keyword) {
            temp->data.display();
            found = true;
        }
        temp = temp->next;
    }
    if (!found)
        cout << "Khong tim thay sach phu hop!" << endl;
}

void LibrarySystem::displayAllUsers() const {
    cout << "\n===== DANH SACH USER =====" << endl;
    UserNode* temp = userHead;
    while (temp) {
        temp->data->displayInfo();
        temp = temp->next;
    }
}
