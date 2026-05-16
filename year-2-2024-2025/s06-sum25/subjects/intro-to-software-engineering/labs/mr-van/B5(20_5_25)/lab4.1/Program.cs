Window win = new Window(1, 2);
Button b = new Button(5, 6);

win.DrawWindow();
b.DrawWindow();


Window[] winArray = new Window[2];
winArray[0] = new Window(1, 2);
winArray[1] = new Button(5, 6);

for (int i = 0; i < 2; i++)
{
    winArray[i].DrawWindow();
}