#include "figures.h"
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Implementation of Point2D methods
void Point2D::Set(double X0, double Y0) {
    X = X0;
    Y = Y0;
}

void Point2D::Move(double dX, double dY) {
    X += dX;
    Y += dY;
}

void Point2D::Scale(double sX, double sY) {
    X *= sX;
    Y *= sY;
}
double Point2D::GetX() {
    return X;
}
double Point2D::GetY() {
    return Y;
}


// Implementation of Circle methods
void Circle::Set(double X0, double Y0, double r) {
    Point2D::Set(X0, Y0); // Call Set from the base class
    Radius = r;
}

void Circle::Move(double dX, double dY) {
    Point2D::Move(dX, dY); // Call Move from the base class
}

double Circle::Area() {
    return M_PI * Radius * Radius; // Area of the circle: πr²
}

double Circle::Perimeter() {
    return 2 * M_PI * Radius; // Perimeter of the circle: 2πr
}
