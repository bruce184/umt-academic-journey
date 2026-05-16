int [,] a = {
    {4, 6, 9},
    {2, 4, 5},
    {9, 2, 6},
    {1, 6, 3}
};

Console.WriteLine("Noi dung mang: ");
for (int i = 0; i <= a.GetUpperBound(0); i++) {
    Console.WriteLine();
    for (int j = 0; j <= a.GetUpperBound(1); j++)
    {
        Console.Write(a[i, j]);
    }
    Console.WriteLine();
}

