#include <iostream>
#include "figures.h" 
using namespace std;

int main() {
    Circle c;

    // Set circle parameters
    c.Set(2, 3, 7); // New center at (2, 3) with a radius of 7

    // Output initial details
    cout << "Initial Circle:" << endl;
    cout << "Area: " << c.Area() << endl;
    cout << "Perimeter: " << c.Perimeter() << endl;

    // Move the circle
    c.Move(5, 4); // Move to (5, 4)

    // Scale the circle
    c.Scale(2, 2); // Scale by a factor of 2

    // Output updated details: the numbers are the same, eventhough it moved but basically it's stats don't change
    cout << "Updated Circle after Move and Scale:" << endl;
    cout << "Area: " << c.Area() << endl;
    cout << "Perimeter: " << c.Perimeter() << endl;
    cout << endl;

    Point2D p;
    p.Set(10, 20); 
    p.Move(5, -3); // move to another location (new X, Y)
    p.Scale(2, 2); // multiple 
    cout << "Initial Point2D: " << p.GetX() <<" "<< p.GetY() << endl;

    return 0;
}
