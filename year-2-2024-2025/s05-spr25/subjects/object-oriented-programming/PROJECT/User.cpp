#include "User.h"
using namespace std;

User::User() : userID(""), username(""), password("") {}

User::User(const string &id, const string &uname, const string &pass)
    : userID(id), username(uname), password(pass) {}

User::~User() {}

string User::getUserID() const { return userID; }
string User::getUsername() const { return username; }
string User::getPassword() const { return password; }

void User::setUserID(const string &id) { userID = id; }
void User::setUsername(const string &uname) { username = uname; }
void User::setPassword(const string &pass) { password = pass; }

void User::displayInfo() const {
    cout << "User ID: " << userID << " | Username: " << username << endl;
}

bool User::isAdmin() const {
    return false;
}

// ===== IMPLEMENTATION CHO ADMIN =====
Admin::Admin() : User() {}

Admin::Admin(const string &id, const string &uname, const string &pass)
    : User(id, uname, pass) {}

bool Admin::isAdmin() const { return true; }

void Admin::displayInfo() const {
    cout << "[ADMIN] User ID: " << userID << " | Username: " << username << endl;
}
