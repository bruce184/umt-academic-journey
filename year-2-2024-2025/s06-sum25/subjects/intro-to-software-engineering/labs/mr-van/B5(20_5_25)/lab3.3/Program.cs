Car myCar = new Car();
myCar.make = "Toyota";
myCar.model = "SR2";
myCar.color = "black";
myCar.year = 1995;

Console.WriteLine("Thong tin chi tiet: ");
Console.WriteLine("Make: " + myCar.make);
Console.WriteLine("Color: " + myCar.color);
Console.WriteLine("Model: " + myCar.model);
Console.WriteLine("year released: " + myCar.year);

myCar.Start();
myCar.Stop(); 