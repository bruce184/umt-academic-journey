class Window
{
    //khai báo các trường
    protected int top;
    protected int left;
    //Phương thức khởi tạo
    public Window(int top, int left)
    {
        this.top = top;
        this.left = left;
    }

    //phương thức virtual vẽ cửa sổ
    public virtual void DrawWindow()
    {
        Console.WriteLine("Window: drawing Window at {0}, {1}", top, left);
    }
}

class Button : Window
{
    public Button(int top, int left) : base(top, left) { }

    public override void DrawWindow()
    {
        Console.WriteLine("Drawing a button at {0}, {1}\n", top, left);
    }
}