class Car
{
// khai báo các trường với phạm vi public
    public string make;
    public string model;
    public string color;
    public int year;
    // định nghĩa phương thức start
    public void Start()
    {
        Console.WriteLine(model + " khoi dong");
    }
// định nghĩa phương thức stop
    public void Stop()
    {
       Console.WriteLine(model + " dung");
    }
}