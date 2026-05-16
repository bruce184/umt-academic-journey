string id, name;
double m1, m2, m3, average;
DateTime dob;

// Input data from keyboard 
Console.Write("Input ID: ");
id = Console.ReadLine() ?? string.Empty;

Console.Write("Input name: ");
name = Console.ReadLine() ?? string.Empty; 

Console.Write("Input DOB: ");
dob = Convert.ToDateTime(Console.ReadLine()); 

Console.Write("Input Mark 1: ");
m1 = Convert.ToDouble(Console.ReadLine()); 

Console.Write("Input Mark 2: ");
m2 = Convert.ToDouble(Console.ReadLine()); 

Console.Write("Input Mark 3: ");
m3 = Convert.ToDouble(Console.ReadLine());

// Calc average 
average = (m1 + m2 + m3) / 3;

// Output 
Console.WriteLine("\nStudent Info: ");
Console.WriteLine("StudentID: " + id);
Console.WriteLine("Student Name: " + name);
Console.WriteLine("Date of birth: " + dob);
Console.WriteLine("Marks: " + m1 + ", " + m2 + ", " + m3);
Console.WriteLine("Average mark: " + average);