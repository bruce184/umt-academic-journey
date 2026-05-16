#ifndef BOOK_H
#define BOOK_H

#include <string>
#include <iostream>
using namespace std;

class Book {
private:
    string bookID;
    string title;
    string author;
    bool isBorrowed; // true: đã mượn, false: còn trong thư viện
public:
    // Constructors
    Book();
    Book(const string &id, const string &t, const string &a, bool b = false);

    // Getter methods
    string getBookID() const;
    string getTitle() const;
    string getAuthor() const;
    bool getIsBorrowed() const;

    // Setter methods
    void setBookID(const string &id);
    void setTitle(const string &t);
    void setAuthor(const string &a);
    void setIsBorrowed(bool b);

    // Nhập thông tin và hiển thị sách
    void input();
    void display() const;
};

#endif // BOOK_H
