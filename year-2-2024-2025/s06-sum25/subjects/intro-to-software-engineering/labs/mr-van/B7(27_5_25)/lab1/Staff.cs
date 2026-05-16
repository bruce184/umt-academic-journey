class Staff : IPerson
{ 
    public void Insert(object obj)
    {
        Console.WriteLine("Save object: " + obj);
    }
    public void Delete(object obj)
    {
        Console.WriteLine("Delete object: " + obj);
     }
    public void Update(object obj)
    {
        Console.WriteLine("Update object: " + obj);
    }
    public void Display(object obj)
    {
        Console.WriteLine("Display object: " + obj);
    }
}