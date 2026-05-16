#include "Book.h"
#include <iostream>
#include <limits>
using namespace std;

Book::Book() : bookID(""), title(""), author(""), isBorrowed(false) {}

Book::Book(const string &id, const string &t, const string &a, bool b)
    : bookID(id), title(t), author(a), isBorrowed(b) {}

string Book::getBookID() const { return bookID; }
string Book::getTitle() const { return title; }
string Book::getAuthor() const { return author; }
bool Book::getIsBorrowed() const { return isBorrowed; }

void Book::setBookID(const string &id) { bookID = id; }
void Book::setTitle(const string &t) { title = t; }
void Book::setAuthor(const string &a) { author = a; }
void Book::setIsBorrowed(bool b) { isBorrowed = b; }

void Book::input() {
    cout << "Nhap ID sach: ";
    getline(cin, bookID);
    cout << "Nhap ten sach: ";
    getline(cin, title);
    cout << "Nhap tac gia: ";
    getline(cin, author);
    isBorrowed = false;
}

void Book::display() const {
    cout << "ID: " << bookID
         << " | Ten sach: " << title
         << " | Tac gia: " << author
         << " | Trang thai: " << (isBorrowed ? "Da muon" : "Con trong thu vien")
         << endl;
}
