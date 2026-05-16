#ifndef USER_H
#define USER_H

#include <string>
#include <iostream>
using namespace std;

class User {
protected:
    string userID;
    string username;
    string password;
public:
    User();
    User(const string &id, const string &uname, const string &pass);
    virtual ~User();

    // Getter methods
    string getUserID() const;
    string getUsername() const;
    string getPassword() const;

    // Setter methods
    void setUserID(const string &id);
    void setUsername(const string &uname);
    void setPassword(const string &pass);

    // Hiển thị thông tin user
    virtual void displayInfo() const;

    // Kiểm tra quyền (mặc định là user thường)
    virtual bool isAdmin() const;
};

class Admin : public User {
public:
    Admin();
    Admin(const string &id, const string &uname, const string &pass);
    bool isAdmin() const override;
    void displayInfo() const override;
};

#endif // USER_H
