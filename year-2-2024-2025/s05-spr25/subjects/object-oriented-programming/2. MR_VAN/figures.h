#ifndef FIGURE_H
#define FIGURE_H

class Point2D{
    double X, Y;
    void Set (double X0, double Yo);
    void Move (double sX, double dY);
    void Scale (double sX, double sY);
};

class Circle : public Point2D{
public: 
        double Radius; 
        void Set (double X0, double Y0, double r);
        void Move (double dX, double dY);
        double Area();
        double Perimeter();
};
#endif