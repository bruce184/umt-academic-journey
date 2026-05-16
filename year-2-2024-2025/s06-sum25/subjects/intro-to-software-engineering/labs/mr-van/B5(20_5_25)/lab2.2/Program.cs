// nếu bật Nullable Reference Types thì thêm dấu ! để bảo đảm Console.ReadLine() không trả về null
string name;
int number;
double money = 0;

// Input 
Console.Write("Input name: ");
name = Console.ReadLine()!;

Console.Write("Input phone number: ");
number = Convert.ToInt32(Console.ReadLine());

// Tính tiền điện
if (number <= 30)
    money = 30;
else if (number <= 50)
    money = 30 + (number - 30) * 1.2;
else
    // 30 (flat) + 20×1.2 + phần vượt 50×1.5
    money = 30 + 20 * 1.2 + (number - 50) * 1.5;

// Xuất kết quả
Console.WriteLine("\nElectric Info:");
Console.WriteLine("Name: " + name);
Console.WriteLine("Phone number: " + number);
Console.WriteLine("Total: " + money.ToString("F2"));
