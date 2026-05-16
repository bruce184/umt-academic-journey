// main.cpp - Complete Program with Enhanced UI, Activity Log, and Extra Features

#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <list>
#include <string>
#include <fstream>
#include <sstream>
#include <cstdio>
#include <ctime>
#include <algorithm>
#include <cerrno>

#ifdef _WIN32
#include <direct.h>   // For _mkdir on Windows
#else
#include <sys/stat.h> // For mkdir on Linux/macOS
#include <sys/types.h>
#endif

using namespace std;

//================== STRUCT Date ==================//
struct Date {
    int day;
    int month;
    int year;
};

// Helper: Convert Date to time_t
time_t convertToTimeT(const Date& d) {
    tm tmDate = { 0 };
    tmDate.tm_mday = d.day;
    tmDate.tm_mon = d.month - 1;
    tmDate.tm_year = d.year - 1900;
    return mktime(&tmDate);
}

//================== STRUCT Activity (for logging user actions) ==================//
struct Activity {
    string username;
    string action;
    string timestamp;
};

// Global activity log
list<Activity> activityLog;

// Helper: Get current time as string
string getCurrentTimeStr() {
    time_t now = time(nullptr);
    char buf[64];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&now));
    return string(buf);
}

// Helper: Log activity for a given user action
void logActivity(const string& username, const string& action) {
    Activity act = { username, action, getCurrentTimeStr() };
    activityLog.push_back(act);
}

//================== CLASS Book ==================//
class Book {
private:
    string id;
    string title;
    string author;
    string category;
    bool isBorrowed;
public:
    Book() : id(""), title(""), author(""), category(""), isBorrowed(false) {}
    Book(const string& id, const string& title, const string& author,
        const string& category, bool isBorrowed = false)
        : id(id), title(title), author(author), category(category), isBorrowed(isBorrowed) {
    }

    // Vì các thành phần của 1 Book là private -> dùng getter, setter 
    string getID() const { return id; }
    string getTitle() const { return title; }
    string getAuthor() const { return author; }
    string getCategory() const { return category; }
    bool getIsBorrowed() const { return isBorrowed; }
    void setTitle(const string& t) { title = t; }
    void setAuthor(const string& a) { author = a; }
    void setCategory(const string& c) { category = c; }
    void setIsBorrowed(bool status) { isBorrowed = status; }
    void display() const {
        cout << "Book ID: " << id << " | Title: " << title
            << " | Author: " << author << " | Category: " << category
            << " | Status: " << (isBorrowed ? "Borrowed" : "Available") << "\n";
    }
};

//================== CLASS BorrowRecord ==================//
class BorrowRecord {
private:
    string borrowID;
    string bookID;
    string userID;
    Date borrowDate;
    Date dueDate;
    Date returnDate;
    bool isReturned;
    bool isProcessed;  // NEW: flag indicating the request has been processed (approved)
public:
    BorrowRecord()
        : borrowID(""), bookID(""), userID(""),
        borrowDate({ 0,0,0 }), dueDate({ 0,0,0 }), returnDate({ 0,0,0 }),
        isReturned(false), isProcessed(false)
    {
    }
    BorrowRecord(const string& brID, const string& bID, const string& uID,
        const Date& bDate, const Date& dDate)
        : borrowID(brID), bookID(bID), userID(uID),
        borrowDate(bDate), dueDate(dDate), returnDate({ 0,0,0 }),
        isReturned(false), isProcessed(false)
    {
    }
    string getBorrowID() const { return borrowID; }
    string getBookID() const { return bookID; }
    string getUserID() const { return userID; }
    Date getBorrowDate() const { return borrowDate; }
    Date getDueDate() const { return dueDate; }
    Date getReturnDate() const { return returnDate; }
    bool getIsReturned() const { return isReturned; }
    bool getIsProcessed() const { return isProcessed; }
    void setReturnDate(const Date& r) { returnDate = r; }
    void setReturned(bool status) { isReturned = status; }
    void setProcessed(bool status) { isProcessed = status; }
    int calculateOverdueDays() const {
        if (!isReturned) return 0;
        double diff = difftime(convertToTimeT(returnDate), convertToTimeT(dueDate));
        int days = static_cast<int>(diff / (60 * 60 * 24));
        return (days > 0) ? days : 0;
    }
    double calculateFine() const {
        int days = calculateOverdueDays();
        return days * 1000.0; // 1000 monetary units per day
    }
};

//================== CLASS User ==================//
class User {
protected:
    string username;
    string password;
    string fullName;
public:
    User() : username(""), password(""), fullName("") {}
    User(const string& uname, const string& pwd, const string& fname)
        : username(uname), password(pwd), fullName(fname) {
    }
    virtual ~User() {}
    string getUsername() const { return username; }
    string getPassword() const { return password; }
    string getFullName() const { return fullName; }
    void setPassword(const string& pwd) { password = pwd; }
    virtual void displayInfo() const {
        cout << "Account: " << username << " | Name: " << fullName << "\n";
    }
};

//================== CLASS Admin (inherits User) ==================//
class Admin : public User {
public:
    Admin() : User() {}
    Admin(const string& uname, const string& pwd, const string& fname)
        : User(uname, pwd, fname) {
    }
    // Manage Books functions
    void addBook(list<Book>& books) {
        char cont;
        do {
            string id, title, author, category;
            cout << "\n===== ADD BOOK =====\n";
            cout << "Enter Book ID: ";
            cin >> id; cin.ignore();
            cout << "Enter Book Title: "; getline(cin, title);
            cout << "Enter Author: "; getline(cin, author);
            cout << "Enter Category: "; getline(cin, category);
            books.push_back(Book(id, title, author, category));
            cout << "Book added successfully!\n";
            cout << "Do you want to continue adding books? (Y/N): ";
            cin >> cont; cin.ignore();
        } while (cont == 'Y' || cont == 'y');
    }
    void editBook(list<Book>& books) {
        char cont;
        do {
            string id;
            cout << "\n===== EDIT BOOK =====\n";
            cout << "Enter Book ID to edit: ";
            cin >> id; cin.ignore();
            bool found = false;
            for (auto& b : books) {
                if (b.getID() == id) {
                    found = true;
                    string title, author, category;
                    cout << "Enter new Title: "; getline(cin, title);
                    cout << "Enter new Author: "; getline(cin, author);
                    cout << "Enter new Category: "; getline(cin, category);
                    b.setTitle(title);
                    b.setAuthor(author);
                    b.setCategory(category);
                    cout << "Book updated successfully!\n";
                    break;
                }
            }
            if (!found)
                cout << "Book with ID " << id << " not found.\n";
            cout << "Do you want to continue editing books? (Y/N): ";
            cin >> cont; cin.ignore();
        } while (cont == 'Y' || cont == 'y');
    }
    void deleteBook(list<Book>& books) {
        char cont;
        do {
            string id;
            cout << "\n===== DELETE BOOK =====\n";
            cout << "Enter Book ID to delete: ";
            cin >> id; cin.ignore();
            bool found = false;
            for (auto it = books.begin(); it != books.end(); ++it) {
                if (it->getID() == id) {
                    books.erase(it);
                    found = true;
                    cout << "Book deleted successfully!\n";
                    break;
                }
            }
            if (!found)
                cout << "Book with ID " << id << " not found.\n";
            cout << "Do you want to continue deleting books? (Y/N): ";
            cin >> cont; cin.ignore();
        } while (cont == 'Y' || cont == 'y');
    }
    // Manage Users functions
    void addUser(list<User>& users) {
        char cont;
        do {
            string uname, pwd, fname;
            cout << "\n===== ADD USER =====\n";
            cout << "Enter Username: ";
            cin >> uname; cin.ignore();
            cout << "Enter Full Name: "; getline(cin, fname);
            cout << "Enter Password: "; getline(cin, pwd);
            users.push_back(User(uname, pwd, fname));
            cout << "User registered successfully!\n";
            cout << "Do you want to continue adding users? (Y/N): ";
            cin >> cont; cin.ignore();
        } while (cont == 'Y' || cont == 'y');
    }
    void viewUsers(const list<User>& users) {
        cout << "\n===== USER LIST =====\n";
        for (const auto& u : users)
            u.displayInfo();
    }
    // Process borrow requests manually (for pending requests)
    // In this version, we assume that user borrow requests are auto-processed.
    // However, if any pending request exists (isProcessed==false), admin can process them.
    void processBorrowRequest(list<BorrowRecord>& records, list<Book>& books) {
        bool pendingFound = false;
        for (auto& r : records) {
            if (!r.getIsProcessed()) { // process only pending requests
                pendingFound = true;
                for (auto& b : books) {
                    if (b.getID() == r.getBookID()) {
                        if (!b.getIsBorrowed()) {
                            b.setIsBorrowed(true);
                            r.setProcessed(true);
                            cout << "Borrow request approved for Book ID: " << b.getID() << "\n";
                            // Optionally, log activity for borrow request processing
                        }
                        else {
                            cout << "Book is already borrowed.\n";
                        }
                        break;
                    }
                }
            }
        }
        if (!pendingFound) {
            cout << "There are no pending borrow requests.\n";
        }
    }
    // View statistics including new fields
    void viewStatistics(const list<Book>& books, const list<User>& users,
        const list<BorrowRecord>& records) {
        int totalBooks = books.size();
        int borrowedBooks = 0;
        for (const auto& b : books)
            if (b.getIsBorrowed())
                borrowedBooks++;
        int availableBooks = totalBooks - borrowedBooks;
        int totalRequests = records.size();
        cout << "\n===== STATISTICS =====\n"
            << "Total Books: " << totalBooks << "\n"
            << "Books Borrowed: " << borrowedBooks << "\n"
            << "Books Available: " << availableBooks << "\n"
            << "Total Users: " << users.size() << "\n"
            << "Number of Borrow Requests: " << totalRequests << "\n";
    }
    // New: View user activity log
    void viewUserActivity(const list<Activity>& activityLog) {
        string uname;
        cout << "\nEnter username to view activities: ";
        cin >> uname; cin.ignore();
        bool found = false;
        cout << "\n===== ACTIVITY LOG for " << uname << " =====\n";
        for (const auto& act : activityLog) {
            if (act.username == uname) {
                cout << "[" << act.timestamp << "] " << act.action << "\n";
                found = true;
            }
        }
        if (!found)
            cout << "No activities found for user " << uname << ".\n";
    }
};

//================== CLASS FileManager ==================//
class FileManager {
public:
    static void saveBooks(const list<Book>& books, const string& filename) {
        ofstream ofs(filename);
        if (!ofs) {
            cerr << "Cannot open file: " << filename << "\n";
            return;
        }
        for (const auto& b : books) {
            ofs << b.getID() << "|" << b.getTitle() << "|" << b.getAuthor()
                << "|" << b.getCategory() << "|" << b.getIsBorrowed() << "\n";
        }
        ofs.close();
    }
    static void loadBooks(list<Book>& books, const string& filename) {
        ifstream ifs(filename);
        if (!ifs) {
            // Create empty file if not exist
            ofstream ofs(filename);
            ofs.close();
            return;
        }
        string line;
        while (getline(ifs, line)) {
            istringstream iss(line);
            string id, title, author, category, borrowStr;
            getline(iss, id, '|');
            getline(iss, title, '|');
            getline(iss, author, '|');
            getline(iss, category, '|');
            getline(iss, borrowStr, '|');
            bool isBorrowed = (borrowStr == "1");
            books.push_back(Book(id, title, author, category, isBorrowed));
        }
        ifs.close();
    }
    static void saveUsers(const list<User>& users, const string& filename) {
        ofstream ofs(filename);
        if (!ofs) {
            cerr << "Cannot open file: " << filename << "\n";
            return;
        }
        for (const auto& u : users)
            ofs << u.getUsername() << "|" << u.getPassword() << "|" << u.getFullName() << "\n";
        ofs.close();
    }
    static void loadUsers(list<User>& users, const string& filename) {
        ifstream ifs(filename);
        if (!ifs) {
            ofstream ofs(filename);
            ofs.close();
            return;
        }
        string line;
        while (getline(ifs, line)) {
            istringstream iss(line);
            string uname, pwd, fname;
            getline(iss, uname, '|');
            getline(iss, pwd, '|');
            getline(iss, fname, '|');
            users.push_back(User(uname, pwd, fname));
        }
        ifs.close();
    }
    static void saveBorrowRecords(const list<BorrowRecord>& records, const string& filename) {
        ofstream ofs(filename);
        if (!ofs) {
            cerr << "Cannot open file: " << filename << "\n";
            return;
        }
        for (const auto& r : records) {
            ofs << r.getBorrowID() << "|" << r.getBookID() << "|" << r.getUserID() << "|"
                << r.getBorrowDate().day << "," << r.getBorrowDate().month << "," << r.getBorrowDate().year << "|"
                << r.getDueDate().day << "," << r.getDueDate().month << "," << r.getDueDate().year << "|"
                << r.getIsReturned() << "|" << (r.getIsProcessed() ? "1" : "0") << "\n";
        }
        ofs.close();
    }
    static void loadBorrowRecords(list<BorrowRecord>& records, const string& filename) {
        ifstream ifs(filename);
        if (!ifs) {
            ofstream ofs(filename);
            ofs.close();
            return;
        }
        string line;
        while (getline(ifs, line)) {
            istringstream iss(line);
            string borrowID, bookID, userID, borrowDateStr, dueDateStr, isReturnedStr, processedStr;
            getline(iss, borrowID, '|');
            getline(iss, bookID, '|');
            getline(iss, userID, '|');
            getline(iss, borrowDateStr, '|');
            getline(iss, dueDateStr, '|');
            getline(iss, isReturnedStr, '|');
            getline(iss, processedStr, '|');
            Date bDate = { 0,0,0 }, dDate = { 0,0,0 };
            sscanf(borrowDateStr.c_str(), "%d,%d,%d", &bDate.day, &bDate.month, &bDate.year);
            sscanf(dueDateStr.c_str(), "%d,%d,%d", &dDate.day, &dDate.month, &dDate.year);
            bool isReturned = (isReturnedStr == "1");
            bool isProcessed = (processedStr == "1");
            BorrowRecord record(borrowID, bookID, userID, bDate, dDate);
            record.setReturned(isReturned);
            record.setProcessed(isProcessed);
            records.push_back(record);
        }
        ifs.close();
    }
};

//================== DIRECTORY AND FILE INITIALIZATION ==================//
#ifdef _WIN32
bool createDir(const string& dirName) {
    if (_mkdir(dirName.c_str()) == 0 || errno == EEXIST)
        return true;
    return false;
}
#else
bool createDir(const string& dirName) {
    if (mkdir(dirName.c_str(), 0755) == 0 || errno == EEXIST)
        return true;
    return false;
}
#endif

void initializeDataFiles() {
    if (!createDir("data")) {
        cout << "Cannot create 'data' directory.\n";
    }
    else {
        cout << "'data' directory exists or was created successfully.\n";
    }
    const string booksFile = "data/books.txt";
    const string usersFile = "data/users.txt";
    const string borrowRecordsFile = "data/borrow_records.txt";

    {
        ifstream ifs(booksFile);
        if (!ifs.good()) {
            ofstream ofs(booksFile);
            ofs.close();
            cout << "Created file '" << booksFile << "'.\n";
        }
    }
    {
        ifstream ifs(usersFile);
        if (!ifs.good()) {
            ofstream ofs(usersFile);
            ofs.close();
            cout << "Created file '" << usersFile << "'.\n";
        }
    }
    {
        ifstream ifs(borrowRecordsFile);
        if (!ifs.good()) {
            ofstream ofs(borrowRecordsFile);
            ofs.close();
            cout << "Created file '" << borrowRecordsFile << "'.\n";
        }
    }
}

//================== MAIN FUNCTION ==================//
int main() {
    // Initialize "data" directory and files if they don't exist
    initializeDataFiles();

    list<Book> books;
    list<User> users;
    list<BorrowRecord> borrowRecords;

    // Load data
    FileManager::loadBooks(books, "data/books.txt");
    FileManager::loadUsers(users, "data/users.txt");
    FileManager::loadBorrowRecords(borrowRecords, "data/borrow_records.txt");

    // Home Menu loop
    while (true) {
        cout << "\n=== HOME MENU ===\n";
        cout << "Select account:\n";
        cout << "1. Admin\n2. User\n0. Exit Program\nChoose: ";
        int role;
        cin >> role; cin.ignore();
        if (role == 0) {
            cout << "Exiting program...\n";
            break;
        }
        if (role == 1) {
            // Admin login
            string username, password;
            cout << "Enter username: "; cin >> username; cin.ignore();
            cout << "Enter password: "; cin >> password; cin.ignore();
            if (username == "admin" && password == "admin") {
                Admin admin(username, password, "Administrator");
                int choice;
                do {
                    cout << "\n----- ADMIN MENU -----\n";
                    cout << "1. Manage Books\n";
                    cout << "2. Manage Users\n";
                    cout << "3. Manage Borrow/Return\n";
                    cout << "4. Statistics\n";
                    cout << "5. Save Data\n";
                    cout << "6. View User Activity\n";
                    cout << "0. Return to Home Menu\nChoose: ";
                    cin >> choice; cin.ignore();
                    switch (choice) {
                    case 1: {
                        int subChoice;
                        do {
                            cout << "\n=== MANAGE BOOKS ===\n";
                            cout << "1. Add Book\n";
                            cout << "2. Edit Book\n";
                            cout << "3. Delete Book\n";
                            cout << "4. Display Book List\n";
                            cout << "0. Return to Admin Menu\nChoose: ";
                            cin >> subChoice; cin.ignore();
                            if (subChoice == 1)
                                admin.addBook(books);
                            else if (subChoice == 2)
                                admin.editBook(books);
                            else if (subChoice == 3)
                                admin.deleteBook(books);
                            else if (subChoice == 4) {
                                cout << "\n=== BOOK LIST ===\n";
                                for (const auto& b : books)
                                    b.display();
                            }
                            else if (subChoice != 0)
                                cout << "Invalid choice!\n";
                        } while (subChoice != 0);
                        break;
                    }
                    case 2: {
                        int subChoice;
                        do {
                            cout << "\n=== MANAGE USERS ===\n";
                            cout << "1. Add User\n";
                            cout << "2. Display User List\n";
                            cout << "0. Return to Admin Menu\nChoose: ";
                            cin >> subChoice; cin.ignore();
                            if (subChoice == 1)
                                admin.addUser(users);
                            else if (subChoice == 2)
                                admin.viewUsers(users);
                            else if (subChoice != 0)
                                cout << "Invalid choice!\n";
                        } while (subChoice != 0);
                        break;
                    }
                    case 3:
                        admin.processBorrowRequest(borrowRecords, books);
                        break;
                    case 4:
                        admin.viewStatistics(books, users, borrowRecords);
                        break;
                    case 5: {
                        FileManager::saveBooks(books, "data/books.txt");
                        FileManager::saveUsers(users, "data/users.txt");
                        FileManager::saveBorrowRecords(borrowRecords, "data/borrow_records.txt");
                        cout << "Data saved successfully!\n";
                        break;
                    }
                    case 6:
                        admin.viewUserActivity(activityLog);
                        break;
                    case 0:
                        cout << "Returning to Home Menu.\n";
                        break;
                    default:
                        cout << "Invalid choice!\n";
                    }
                } while (choice != 0);
            }
            else {
                cout << "Admin login failed!\n";
            }
        }
        else if (role == 2) {
            // User login
            string username, password;
            cout << "Enter username: "; cin >> username; cin.ignore();
            cout << "Enter password: "; cin >> password; cin.ignore();
            bool valid = false;
            for (auto& u : users) {
                if (u.getUsername() == username && u.getPassword() == password) {
                    valid = true;
                    int choice;
                    do {
                        cout << "\n----- USER MENU -----\n";
                        cout << "1. Search Books\n";
                        cout << "2. Display Book List\n";
                        cout << "3. Send Borrow Request\n";
                        cout << "4. Save Data\n";
                        cout << "0. Return to Home Menu\nChoose: ";
                        cin >> choice; cin.ignore();
                        switch (choice) {
                        case 1: {
                            char cont;
                            do {
                                string key;
                                cout << "\n=== SEARCH BOOKS ===\n";
                                cout << "Enter search keyword (ID, title, author, category): ";
                                getline(cin, key);
                                bool found = false;
                                for (const auto& b : books) {
                                    if (b.getID().find(key) != string::npos
                                        || b.getTitle().find(key) != string::npos
                                        || b.getAuthor().find(key) != string::npos
                                        || b.getCategory().find(key) != string::npos) {
                                        b.display();
                                        found = true;
                                    }
                                }
                                if (!found)
                                    cout << "No books found.\n";
                                logActivity(username, "Searched books using keyword: " + key);
                                cout << "Do you want to continue searching? (Y/N): ";
                                cin >> cont; cin.ignore();
                            } while (cont == 'Y' || cont == 'y');
                            break;
                        }
                        case 2: {
                            cout << "\n=== BOOK LIST ===\n";
                            for (const auto& b : books)
                                b.display();
                            logActivity(username, "Viewed book list");
                            break;
                        }
                        case 3: {
                            char cont;
                            do {
                                cout << "\n=== SEND BORROW REQUEST ===\n";
                                string bookID;
                                cout << "Enter Book ID to borrow: ";
                                cin >> bookID; cin.ignore();
                                // Check if book exists and is available
                                bool found = false;
                                for (auto& b : books) {
                                    if (b.getID() == bookID) {
                                        found = true;
                                        if (!b.getIsBorrowed()) {
                                            b.setIsBorrowed(true); // self-update status
                                            Date today, due;
                                            cout << "Enter borrow date (day month year): ";
                                            cin >> today.day >> today.month >> today.year;
                                            cout << "Enter due date (day month year): ";
                                            cin >> due.day >> due.month >> due.year;
                                            cin.ignore();
                                            string borrowID = "BR" + bookID;
                                            BorrowRecord newRecord(borrowID, bookID, username, today, due);
                                            newRecord.setProcessed(true);  // Auto-processed
                                            borrowRecords.push_back(newRecord);
                                            cout << "Borrow request sent and processed successfully!\n";
                                            logActivity(username, "Requested to borrow book: " + bookID);
                                        }
                                        else {
                                            cout << "Book is already borrowed. Request denied.\n";
                                        }
                                        break;
                                    }
                                }
                                if (!found) {
                                    cout << "Book with ID " << bookID << " not found.\n";
                                }
                                cout << "Do you want to continue sending borrow requests? (Y/N): ";
                                cin >> cont; cin.ignore();
                            } while (cont == 'Y' || cont == 'y');
                            break;
                        }
                        case 4: {
                            FileManager::saveBooks(books, "data/books.txt");
                            FileManager::saveUsers(users, "data/users.txt");
                            FileManager::saveBorrowRecords(borrowRecords, "data/borrow_records.txt");
                            cout << "Data saved successfully!\n";
                            break;
                        }
                        case 0:
                            cout << "Returning to Home Menu.\n";
                            break;
                        default:
                            cout << "Invalid choice!\n";
                        }
                    } while (choice != 0);
                    break;
                }
            }
            if (!valid)
                cout << "Invalid login or account does not exist!\n";
        }
        else {
            cout << "Invalid choice!\n";
        }
    }
    return 0;
}
