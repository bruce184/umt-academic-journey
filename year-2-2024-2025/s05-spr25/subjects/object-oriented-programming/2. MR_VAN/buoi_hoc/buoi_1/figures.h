#ifndef FIGURES_H
#define FIGURES_H

#include <cmath>

class Point2D {
protected:
    double X, Y; // Set these to `protected` so derived classes can access them.

public:
    // Public member functions
    void Set(double X0, double Y0);
    void Move(double dX, double dY);
    void Scale(double sX, double sY);
    double GetX();
    double GetY();
};

class Circle : public Point2D {
private:
    double Radius; // Set this to private for encapsulation

public:
    void Set(double X0, double Y0, double r);
    void Move(double dX, double dY);
    double Area();
    double Perimeter();
};

#endif
